import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import { register, login, requireAuth, oauthLogin, forgotStart, forgotVerify, forgotReset, getMe, updateUsername, addScoreToUser, collectRewards, getLeaderboard } from "./auth.js"
import { send as sendOtp, verify as verifyOtp } from "./otp.js"
import { puzzle, submit } from "./game.js"
import { top, addScore } from "./leaderboard.js"
import { on, emit, Events } from "./events.js"

dotenv.config({ path: "../../.env" })

const app = express()
app.use(express.json())
// Allow both 5173 and 5174 for development
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"]
app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  }, 
  credentials: true 
}))

app.post("/auth/register", register)
app.post("/auth/login", login)
app.get("/auth/oauth/:provider", oauthLogin)
app.post("/auth/forgot/start", forgotStart)
app.post("/auth/forgot/verify", forgotVerify)
app.post("/auth/forgot/reset", forgotReset)
app.get("/auth/me", requireAuth, getMe)
app.post("/auth/username", requireAuth, updateUsername)
app.post("/auth/collect", requireAuth, collectRewards)
app.get("/auth/leaderboard", getLeaderboard)

app.post("/otp/send", sendOtp)
app.post("/otp/verify", verifyOtp)

app.get("/game/puzzle", requireAuth, puzzle)
app.post("/game/submit", requireAuth, (req, res) => {
  const { earned } = req.body
  addScoreToUser(req.user.sub, Math.floor(earned))
  submit(req, res)
})
app.get("/leaderboard", requireAuth, top)

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN || "http://localhost:5173" } })

io.on("connection", socket => {
  socket.on("chat", msg => {
    io.emit("chat", msg)
  })
})

on(Events.UserLoggedIn, e => {})
on(Events.OTPVerified, e => {})
on(Events.GameStarted, e => {})
on(Events.PuzzleSolved, e => {})
on(Events.ScoreUpdated, e => {})
on(Events.AchievementUnlocked, e => {})

const port = Number(process.env.PORT_BACKEND || 5080)
httpServer.listen(port, () => {
  console.log(`Backend server listening on port ${port}`)
})
