import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../utils/api"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { setToken, setMfaVerified } = useAuth()
  const [mode, setMode] = useState("email")
  const [identifier, setIdentifier] = useState("")
  const [idError, setIdError] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneCode, setPhoneCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [codeError, setCodeError] = useState("")
  const [showForgot, setShowForgot] = useState(false)
  const [resetId, setResetId] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [resetPreview, setResetPreview] = useState("")
  const [newPw, setNewPw] = useState("")
  const [newPwConfirm, setNewPwConfirm] = useState("")
  const [showGoogle, setShowGoogle] = useState(false)

  function validateIdentifier(id) {
    if (mode !== "email") return ""
    if (!id.includes("@")) return "Email must contain @"
    const parts = id.split("@")
    if (parts.length !== 2) return "Invalid email"
    const domain = parts[1].toLowerCase()
    if (domain.includes("gmail") && !domain.endsWith("gmail.com")) return "Gmail domain must be gmail.com"
    return ""
  }

  function validatePhone(code, num) {
    const codeOk = /^\+\d{1,3}$/.test(code)
    const numOk = /^\d{10}$/.test(num)
    if (!codeOk) return "Country code must start with + and 1-3 digits"
    if (!numOk) return "Phone number must be 10 digits"
    return ""
  }

  async function onLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (mode === "email") {
      const v = validateIdentifier(identifier)
      setIdError(v)
      if (v) { setLoading(false); return }
    } else {
      const v = validatePhone(phoneCode, phoneNumber)
      setIdError(v)
      if (v) { setLoading(false); return }
    }
    try {
      const id = mode === "phone" ? phoneNumber : identifier
      const res = await api.post("/auth/login", { mode, identifier: id, password, remember })
      const { loginTokenId } = res.data
      sessionStorage.setItem("loginTokenId", loginTokenId)
      sessionStorage.setItem("loginMode", mode)
      await api.post("/otp/send", { loginTokenId, channel: mode === "phone" ? "sms" : "email" })
      setToken("")
      setMfaVerified(false)
      navigate("/otp")
    } catch (err) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail")
    const savedPassword = sessionStorage.getItem("savedPassword")
    if (savedEmail) {
      setIdentifier(savedEmail)
      setIdError(validateIdentifier(savedEmail))
    }
    if (savedEmail && savedPassword && mode === "email") {
      ;(async () => {
        setLoading(true)
        setError("")
        try {
          const res = await api.post("/auth/login", { mode: "email", identifier: savedEmail, password: savedPassword, remember: true })
          const { loginTokenId } = res.data
          sessionStorage.setItem("loginTokenId", loginTokenId)
          sessionStorage.removeItem("savedPassword")
          setToken("")
          setMfaVerified(false)
          navigate("/otp")
        } catch {
          setError("Login failed")
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode("email")} className={`px-3 py-2 rounded ${mode==="email"?"bg-banana text-black":"bg-white/60"}`}>Email</button>
          <button onClick={() => setMode("phone")} className={`px-3 py-2 rounded ${mode==="phone"?"bg-banana text-black":"bg-white/60"}`}>Phone</button>
          <button onClick={() => setShowGoogle(true)} className="px-3 py-2 rounded bg-white/60">Google</button>
          <button onClick={() => navigate("/oauth/facebook")} className="px-3 py-2 rounded bg-white/60">Facebook</button>
        </div>
        <form onSubmit={onLogin} className="space-y-3">
          {mode==="email" ? (
            <input
              type="email"
              placeholder="Email"
              value={identifier}
              onChange={e=>{
                setIdentifier(e.target.value)
                setIdError(validateIdentifier(e.target.value))
              }}
              className="w-full px-4 py-3 rounded bg-white/70"
              required
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneCode}
                onChange={e=>{
                  setPhoneCode(e.target.value)
                  const v = validatePhone(e.target.value, phoneNumber)
                  setIdError(v)
                }}
                className="w-24 px-4 py-3 rounded bg-white/70"
                placeholder="+91"
                required
              />
              <input
                type="tel"
                value={phoneNumber}
                onChange={e=>{
                  const val = e.target.value.replace(/\D/g,"").slice(0,10)
                  setPhoneNumber(val)
                  const v = validatePhone(phoneCode, val)
                  setIdError(v)
                }}
                className="flex-1 px-4 py-3 rounded bg-white/70"
                placeholder="10-digit phone"
                required
              />
            </div>
          )}
          {idError && <div className="text-red-600 text-sm">{idError}</div>}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/70 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow(s=>!s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              aria-label="Toggle password"
              title="Show password"
            >
              <span className="text-xl">{show ? "🙈" : "👁️"}</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
              <span>Remember Me</span>
            </label>
            <button type="button" onClick={()=>setShowForgot(true)} className="text-sm text-banana-dark">Forgot Password</button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full px-4 py-3 rounded-xl bg-banana text-black font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-2 text-sm">
          New here?
          <button onClick={() => navigate("/register")} className="ml-1 text-banana-dark">Create Account</button>
        </div>
      </div>
      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="glass p-6 rounded-2xl w-full max-w-sm">
            <div className="text-lg mb-2">Reset Password</div>
            {resetId ? (
              <>
                <div className="mb-2">Enter OTP sent to your {mode}</div>
                <input value={resetOtp} onChange={e=>setResetOtp(e.target.value)} className="w-full px-3 py-2 rounded bg-white/70 mb-2" placeholder="6-digit OTP" />
                {resetPreview && <div className="text-xs text-black/60 mb-2">Dev code {resetPreview}</div>}
                <div className="relative mb-2">
                  <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="New Password" className="w-full px-3 py-2 rounded bg-white/70" />
                </div>
                <div className="relative mb-2">
                  <input type="password" value={newPwConfirm} onChange={e=>setNewPwConfirm(e.target.value)} placeholder="Confirm Password" className="w-full px-3 py-2 rounded bg-white/70" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async ()=>{
                      try {
                        await api.post("/auth/forgot/verify", { resetId, otp: resetOtp })
                        if (newPw !== newPwConfirm || newPw.length < 8) return
                        await api.post("/auth/forgot/reset", { resetId, newPassword: newPw })
                        setShowForgot(false)
                        setResetId("")
                        setResetOtp("")
                        setResetPreview("")
                        setNewPw("")
                        setNewPwConfirm("")
                      } catch {}
                    }}
                    className="px-3 py-2 rounded bg-banana text-black"
                  >
                    Verify & Reset
                  </button>
                  <button onClick={()=>{setShowForgot(false); setResetId(""); setResetOtp(""); setResetPreview("");}} className="px-3 py-2 rounded bg-white/60">Close</button>
                </div>
              </>
            ) : (
              <>
                {mode==="email" ? (
                  <input
                    type="email"
                    value={identifier}
                    onChange={e=>setIdentifier(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white/70 mb-2"
                    placeholder="Email"
                  />
                ) : (
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)} className="w-24 px-3 py-2 rounded bg-white/70" placeholder="+91" />
                    <input type="tel" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value.replace(/\D/g,'').slice(0,10))} className="flex-1 px-3 py-2 rounded bg-white/70" placeholder="10-digit phone" />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async ()=>{
                      try {
                        const id = mode==="phone" ? phoneNumber : identifier
                        const r = await api.post("/auth/forgot/start", { mode, identifier: id })
                        setResetId(r.data.resetId)
                        if (r.data.previewCode) setResetPreview(r.data.previewCode)
                      } catch {}
                    }}
                    className="px-3 py-2 rounded bg-banana text-black"
                  >
                    Send OTP
                  </button>
                  <button onClick={()=>setShowForgot(false)} className="px-3 py-2 rounded bg-white/60">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showGoogle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="glass p-6 rounded-2xl w-full max-w-sm">
            <div className="text-lg mb-2">Choose Google account</div>
            <div className="space-y-2">
              {["user1@gmail.com","user2@gmail.com"].map(email => (
                <button
                  key={email}
                  onClick={async ()=>{
                    try {
                      const r = await api.get("/auth/oauth/google", { params: { email } })
                      const { loginTokenId } = r.data
                      sessionStorage.setItem("loginTokenId", loginTokenId)
                      await api.post("/otp/send", { loginTokenId, channel: "email" })
                      setToken("")
                      setMfaVerified(false)
                      setShowGoogle(false)
                      navigate("/otp")
                    } catch {}
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-white/70"
                >
                  {email}
                </button>
              ))}
              <button onClick={()=>setShowGoogle(false)} className="px-3 py-2 rounded bg-white/60 w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
