import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { emit, Events } from "./events.js"

const users = new Map()
const loginTokens = new Map()
const resets = new Map()

function phoneKey(raw) {
  const digits = String(raw).replace(/\D/g, "")
  if (digits.length !== 10) return null
  return `phone:${digits}`
}

export function register(req, res) {
  const { mode, identifier, password, firstName, lastName } = req.body
  if (!identifier || !password) return res.status(400).json({ error: "invalid" })
  const valid = password.length >= 8
  if (!valid) return res.status(400).json({ error: "weak_password" })
  
  let key = `${mode}:${identifier}`
  if (users.has(key)) return res.status(400).json({ error: "exists" })
  const hash = bcrypt.hashSync(password, 10)
  users.set(key, { 
    id: uuidv4(), 
    mode, 
    identifier, 
    hash, 
    roles: ["Player"],
    firstName: firstName || "",
    lastName: lastName || "",
    username: "",
    stats: {
      score: 0,
      diamonds: 500,
      energy: 0,
      streak: 0,
      level: 1,
      rank: "Novice"
    }
  })
  res.json({ ok: true })
}

export function login(req, res) {
  const { mode, identifier, password, remember } = req.body
  let key = `${mode}:${identifier}`
  if (mode === "phone") {
    const pk = phoneKey(identifier)
    if (!pk) return res.status(400).json({ error: "invalid_phone" })
    key = pk
  }
  const user = users.get(key)
  if (!user || !bcrypt.compareSync(password, user.hash)) return res.status(401).json({ error: "unauthorized" })
  const loginTokenId = uuidv4()
  const expiresAt = Date.now() + 5 * 60 * 1000
  loginTokens.set(loginTokenId, { user, expiresAt, verified: false })
  emit(Events.UserLoggedIn, { userId: user.id, mode })
  res.json({ loginTokenId, remember })
}

export function issueJwt(user) {
  const secret = process.env.JWT_SECRET || "dev"
  const payload = { sub: user.id, roles: user.roles }
  return jwt.sign(payload, secret, { expiresIn: "2h" })
}

export function getLoginToken(id) {
  const t = loginTokens.get(id)
  if (!t) return null
  if (Date.now() > t.expiresAt) {
    loginTokens.delete(id)
    return null
  }
  return t
}

export function verifyLoginToken(id) {
  const t = getLoginToken(id)
  if (!t) return null
  t.verified = true
  return t
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!token) return res.status(401).json({ error: "no_token" })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev")
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: "invalid_token" })
  }
}

function genOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0")
}

export function oauthLogin(req, res) {
  const provider = req.params.provider
  const email = String(req.query.email || "")
  if (!email.includes("@")) return res.status(400).json({ error: "invalid_email" })
  if (provider === "google") {
    const domain = email.split("@")[1]?.toLowerCase() || ""
    if (!domain.endsWith("gmail.com")) return res.status(400).json({ error: "invalid_email" })
  }
  const key = `email:${email}`
  let user = users.get(key)
  if (!user) {
    const hash = bcrypt.hashSync(uuidv4(), 10)
    user = { 
      id: uuidv4(), 
      mode: "email", 
      identifier: email, 
      hash, 
      roles: ["Player"],
      username: "",
      stats: {
        score: 0,
        diamonds: 500,
        energy: 0,
        streak: 0,
        level: 1,
        rank: "Novice"
      }
    }
    users.set(key, user)
  }
  const loginTokenId = uuidv4()
  const expiresAt = Date.now() + 5 * 60 * 1000
  loginTokens.set(loginTokenId, { user, expiresAt, verified: false })
  res.json({ loginTokenId })
}

export function forgotStart(req, res) {
  const { mode, identifier } = req.body
  let key = `${mode}:${identifier}`
  if (mode === "phone") {
    const pk = phoneKey(identifier)
    if (!pk) return res.status(400).json({ error: "invalid_phone" })
    key = pk
  }
  const user = users.get(key)
  if (!user) return res.status(404).json({ error: "not_found" })
  const resetId = uuidv4()
  const code = genOtp()
  const expiresAt = Date.now() + 2 * 60 * 1000
  resets.set(resetId, { key, code, expiresAt, verified: false })
  if (process.env.NODE_ENV !== "production") res.json({ resetId, previewCode: code })
  else res.json({ resetId })
}

export function forgotVerify(req, res) {
  const { resetId, otp } = req.body
  const r = resets.get(resetId)
  if (!r) return res.status(400).json({ error: "invalid_reset" })
  if (Date.now() > r.expiresAt) return res.status(400).json({ error: "expired" })
  if (String(r.code) !== String(otp)) return res.status(400).json({ error: "mismatch" })
  r.verified = true
  res.json({ verified: true })
}

export function forgotReset(req, res) {
  const { resetId, newPassword } = req.body
  const r = resets.get(resetId)
  if (!r || !r.verified) return res.status(400).json({ error: "invalid_reset" })
  const strong = newPassword && newPassword.length >= 8 && /[A-Za-z]/.test(newPassword)
  if (!strong) return res.status(400).json({ error: "weak_password" })
  const user = users.get(r.key)
  if (!user) return res.status(404).json({ error: "not_found" })
  user.hash = bcrypt.hashSync(newPassword, 10)
  resets.delete(resetId)
  res.json({ ok: true })
}

export function getMe(req, res) {
  const userId = req.user.sub
  const user = Array.from(users.values()).find(u => u.id === userId)
  if (!user) return res.status(404).json({ error: "not_found" })
  
  const { hash, ...publicUser } = user
  res.json(publicUser)
}

export function updateUsername(req, res) {
  const userId = req.user.sub
  const { username } = req.body
  if (!username) return res.status(400).json({ error: "missing_username" })
  
  const user = Array.from(users.values()).find(u => u.id === userId)
  if (!user) return res.status(404).json({ error: "not_found" })
  
  // Check if username already exists for another user
  const exists = Array.from(users.values()).some(u => u.username === username && u.id !== userId)
  if (exists) return res.status(400).json({ error: "username_taken" })
  
  user.username = username
  const { hash, ...publicUser } = user
  res.json(publicUser)
}

export function addScoreToUser(userId, earned) {
  const user = Array.from(users.values()).find(u => u.id === userId)
  if (user) {
    user.stats.score += earned
    // Every 1000 score, increase level
    user.stats.level = Math.floor(user.stats.score / 1000) + 1
    // Simple rank system
    if (user.stats.score > 10000) user.stats.rank = "Grandmaster"
    else if (user.stats.score > 5000) user.stats.rank = "Master"
    else if (user.stats.score > 2000) user.stats.rank = "Expert"
    else if (user.stats.score > 1000) user.stats.rank = "Apprentice"
  }
}
