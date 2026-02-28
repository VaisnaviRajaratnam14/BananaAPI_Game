import crypto from "crypto"
import nodemailer from "nodemailer"
import { emit, Events } from "./events.js"
import { getLoginToken, verifyLoginToken, issueJwt } from "./auth.js"

const store = new Map()
const smsLog = []

function genOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0")
}

async function sendEmail(to, code) {
  const mode = process.env.EMAIL_SERVICE || "dev"
  if (mode === "dev") return true
  const transporter = nodemailer.createTransport({ sendmail: true })
  await transporter.sendMail({ to, from: "no-reply@banana.local", subject: "Your OTP", text: `Code: ${code}` })
  return true
}

async function sendSms(to, code) {
  const mode = process.env.SMS_SERVICE || "dev"
  if (mode === "dev") {
    smsLog.push({ to, code, at: Date.now() })
    return true
  }
  return true
}

export async function send(req, res) {
  const { loginTokenId, channel } = req.body
  const t = getLoginToken(loginTokenId)
  if (!t) return res.status(400).json({ error: "invalid_token" })
  const code = genOtp()
  const expiresAt = Date.now() + 2 * 60 * 1000
  store.set(loginTokenId, { code, expiresAt })
  if (channel === "email" && t.user.mode === "email") {
    await sendEmail(t.user.identifier, code)
  }
  if (channel === "sms" && t.user.mode === "phone") {
    await sendSms(t.user.identifier, code)
  }
  if (process.env.NODE_ENV !== "production") res.json({ ok: true, previewCode: code })
  else res.json({ ok: true })
}

export function verify(req, res) {
  const { loginTokenId, otp } = req.body
  const t = getLoginToken(loginTokenId)
  if (!t) return res.status(400).json({ error: "invalid_token" })
  const entry = store.get(loginTokenId)
  if (!entry) return res.status(400).json({ error: "no_code" })
  if (Date.now() > entry.expiresAt) return res.status(400).json({ error: "expired" })
  if (String(entry.code) !== String(otp)) return res.status(400).json({ error: "mismatch" })
  verifyLoginToken(loginTokenId)
  const jwt = issueJwt(t.user)
  emit(Events.OTPVerified, { userId: t.user.id })
  res.json({ jwt })
}
