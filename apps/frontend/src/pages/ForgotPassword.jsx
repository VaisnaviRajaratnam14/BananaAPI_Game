import React, { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { api } from "../utils/api"
import { useLanguage } from "../context/LanguageContext"
import bgImage from "../assets/background.avif"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [params] = useSearchParams()
  const prefetchedEmail = useMemo(() => (params.get("email") || "").trim(), [params])

  const [email, setEmail] = useState(prefetchedEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError("Please enter your email")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      await api.post("forgot-password/", {
        email: normalizedEmail,
      })
      setSuccess("If the email is registered, a password reset link will be sent.")
      window.setTimeout(() => navigate("/login"), 1800)
    } catch (err) {
      const msg = err?.response?.data?.error || "Could not send reset email"
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
        <h1 className="text-3xl font-black text-cyan-300 uppercase mb-2">
          {t("login.forgotPassword", "Forgot Password?")}
        </h1>
        <p className="text-cyan-200/70 text-sm mb-6">Enter your login email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.email", "EMAIL")}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" className="inline-block mt-5 text-cyan-300 hover:text-orange-300 font-bold text-sm">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
