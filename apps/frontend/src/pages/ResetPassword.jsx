import React, { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../utils/api"
import bgImage from "../assets/background.avif"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const uid = useMemo(() => (params.get("uid") || "").trim(), [params])
  const token = useMemo(() => (params.get("token") || "").trim(), [params])

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!uid || !token) {
      setError("Invalid or expired reset link")
      return
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await api.post("auth/password/reset/", { uid, token, newPassword })
      setSuccess("Password reset successful. Redirecting to login...")
      window.setTimeout(() => navigate("/login"), 1400)
    } catch (err) {
      const msg = err?.response?.data?.error || "Could not reset password"
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[#0a1628]/70" />

      <div className="relative z-10 w-full max-w-sm bg-[#0d1f3c]/90 backdrop-blur-md p-8 rounded-[2.2rem] border-2 border-cyan-400/60 text-center">
        <h1 className="text-3xl font-black text-cyan-300 uppercase mb-2">Reset Password</h1>
        <p className="text-cyan-200/70 text-sm mb-6">Set a new password for your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full bg-[#071428] text-white placeholder-white/30 px-4 py-3 rounded-xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none"
            required
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full bg-[#071428] text-white placeholder-white/30 px-4 py-3 rounded-xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none"
            required
          />

          {error && (
            <div className="bg-red-500/20 border border-red-400/60 rounded-xl p-2 text-red-300 text-xs font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-400/60 rounded-xl p-2 text-green-300 text-xs font-bold">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-black py-3 rounded-xl"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link to="/login" className="inline-block mt-5 text-cyan-300 hover:text-orange-300 font-bold text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
