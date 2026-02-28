import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../utils/api"
import { useAuth } from "../context/AuthContext"

export default function Otp() {
  const navigate = useNavigate()
  const { setToken, setMfaVerified } = useAuth()
  const [otp, setOtp] = useState("")
  const [seconds, setSeconds] = useState(60)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [devCode, setDevCode] = useState("")

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    const loginTokenId = sessionStorage.getItem("loginTokenId")
    const loginMode = sessionStorage.getItem("loginMode") || "email"
    if (!loginTokenId) return
    api.post("/otp/send", { loginTokenId, channel: loginMode === "phone" ? "sms" : "email" }).then(r => {
      if (r.data.previewCode) setDevCode(r.data.previewCode)
      setSeconds(60)
    }).catch(() => {})
  }, [])

  async function resend() {
    const loginTokenId = sessionStorage.getItem("loginTokenId")
    const loginMode = sessionStorage.getItem("loginMode") || "email"
    if (!loginTokenId) return
    setSending(true)
    setError("")
    try {
      await api.post("/otp/send", { loginTokenId, channel: loginMode === "phone" ? "sms" : "email" })
      setSeconds(60)
    } catch {
      setError("Failed to resend")
    } finally {
      setSending(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    const loginTokenId = sessionStorage.getItem("loginTokenId")
    if (!loginTokenId) return
    try {
      const res = await api.post("/otp/verify", { loginTokenId, otp })
      const { jwt } = res.data
      setToken(jwt)
      setMfaVerified(true)
      navigate("/dashboard")
    } catch {
      setError("Invalid code")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <div className="text-xl mb-4">Enter 6-digit OTP</div>
        <form onSubmit={verify} className="space-y-3">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={e=>setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded bg-white/70 tracking-widest text-center text-2xl"
            placeholder="••••••"
            required
          />
          <div className="flex items-center justify-between text-sm">
            <div>Resend in {seconds}s</div>
            <button type="button" disabled={seconds>0 || sending} onClick={resend} className="text-banana-dark">
              Resend OTP
            </button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {devCode && <div className="text-xs text-black/60">Dev code {devCode}</div>}
          <button className="w-full px-4 py-3 rounded-xl bg-banana text-black font-semibold">Verify</button>
        </form>
      </div>
    </div>
  )
}
