import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../utils/api"

function strengthLabel(pw) {
  const len = pw.length >= 8
  const letters = /[A-Za-z]/.test(pw)
  const numbers = /[0-9]/.test(pw)
  const special = /[^A-Za-z0-9]/.test(pw)
  const score = (len?1:0) + (letters?1:0) + (numbers?1:0) + (special?1:0)
  return score >= 3 ? "Strong" : "Weak"
}

export default function Register() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("email")
  const [identifier, setIdentifier] = useState("")
  const [idError, setIdError] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveCreds, setSaveCreds] = useState(false)

  function validateIdentifier(id) {
    if (mode !== "email") return ""
    if (!id.includes("@")) return "Email must contain @"
    const parts = id.split("@")
    if (parts.length !== 2) return "Invalid email"
    const domain = parts[1].toLowerCase()
    if (domain.includes("gmail") && !domain.endsWith("gmail.com")) return "Gmail domain must be gmail.com"
    return ""
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    const v = validateIdentifier(identifier)
    setIdError(v)
    if (v) return
    const strongEnough = password.length >= 8 && /[A-Za-z]/.test(password)
    if (!strongEnough) {
      setError("Password must be at least 8 characters and include letters")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/register", { mode, identifier, password })
      if (saveCreds && mode === "email") {
        localStorage.setItem("savedEmail", identifier)
        sessionStorage.setItem("savedPassword", password)
        const r = await api.post("/auth/login", { mode, identifier, password, remember: true })
        const { loginTokenId } = r.data
        sessionStorage.setItem("loginTokenId", loginTokenId)
        setSuccess(false)
        navigate("/otp")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      const msg = err?.response?.data?.error
      if (msg === "weak_password") setError("Password too weak (min 8 chars, include letters)")
      else if (msg === "exists") setError("Account already exists")
      else if (msg === "invalid_email") setError("Invalid email address")
      else setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass p-8 rounded-2xl w-full max-w-md">
        <div className="mb-4 text-xl">Create Account</div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode("email")} className={`px-3 py-2 rounded ${mode==="email"?"bg-banana text-black":"bg-white/60"}`}>Email</button>
          <button onClick={() => setMode("phone")} className={`px-3 py-2 rounded ${mode==="phone"?"bg-banana text-black":"bg-white/60"}`}>Phone</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type={mode==="phone"?"tel":"email"}
            placeholder={mode==="phone"?"Phone number":"Email"}
            value={identifier}
            onChange={e=>{
              setIdentifier(e.target.value)
              setIdError(validateIdentifier(e.target.value))
            }}
            className="w-full px-4 py-3 rounded bg-white/70"
            required
          />
          {idError && <div className="text-red-600 text-sm">{idError}</div>}
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/70 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(s=>!s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              aria-label="Toggle password"
              title="Show password"
            >
              <span className="text-xl">{showPw ? "🙈" : "👁️"}</span>
            </button>
          </div>
          <div className={`text-sm ${strengthLabel(password)==="Strong"?"text-green-700":"text-red-700"}`}>
            {strengthLabel(password)}
          </div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={e=>setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/70 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s=>!s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              aria-label="Toggle password"
              title="Show password"
            >
              <span className="text-xl">{showConfirm ? "🙈" : "👁️"}</span>
            </button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={saveCreds} onChange={e=>setSaveCreds(e.target.checked)} />
            <span>Save email and password for quick login</span>
          </label>
          <button disabled={loading} className="w-full px-4 py-3 rounded-xl bg-banana text-black font-semibold">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <div className="mt-2 text-sm">
          Already have an account?
          <button onClick={() => navigate("/login")} className="ml-1 text-banana-dark">Login</button>
        </div>
      </div>
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="glass p-6 rounded-2xl w-full max-w-sm text-center">
            <div className="text-xl mb-2">Account is succesfully create</div>
            <div className="text-black/70 mb-4">You can login now</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setSuccess(false); navigate("/login") }} className="px-4 py-2 rounded bg-banana text-black">Go to Login</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
