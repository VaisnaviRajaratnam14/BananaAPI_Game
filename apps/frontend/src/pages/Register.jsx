import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import bgImage from "../assets/background.avif"

export default function Register() {
  const navigate = useNavigate()
  const { login, setUser } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleBtnRef = useRef(null)

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      })

      googleBtnRef.current.innerHTML = ""
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signup_with",
        width: 360,
      })
    }

    if (window.google?.accounts?.id) {
      initializeGoogle()
      return
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener("load", initializeGoogle)
      return () => existing.removeEventListener("load", initializeGoogle)
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = initializeGoogle
    document.body.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [])

  async function handleGoogleCredential(response) {
    if (!response?.credential) return

    setGoogleLoading(true)
    setError("")
    try {
      const res = await api.post("auth/google/", { id_token: response.credential })
      const { access, user } = res.data
      login(access)
      if (user) setUser(user)
      navigate("/intro")
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || "Google signup failed"
      setError(String(msg).toUpperCase())
    } finally {
      setGoogleLoading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Frontend Validation
    if (firstName.trim().length < 2) {
      setLoading(false)
      return setError("FIRST NAME: Must be at least 2 characters")
    }
    if (lastName.trim().length < 2) {
      setLoading(false)
      return setError("LAST NAME: Must be at least 2 characters")
    }
    if (username.trim().length < 3) {
      setLoading(false)
      return setError("NICKNAME: Must be at least 3 characters")
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLoading(false)
      return setError("EMAIL: Please enter a valid email address")
    }
    if (password.length < 4) {
      setLoading(false)
      return setError("PASSWORD: Must be at least 4 characters")
    }
    
    try {
      await api.post("auth/register/", { 
        username: username.trim(),
        email: email.trim().toLowerCase(), 
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        nickname: username.trim()
      })
      
      // Navigate to login page after successful registration
      navigate("/login")
    } catch (err) {
      const serverError = err?.response?.data
      if (serverError) {
        // Collect all error messages from the object
        const allErrors = Object.entries(serverError)
          .map(([key, value]) => `${key.toUpperCase()}: ${Array.isArray(value) ? value[0] : value}`)
          .join(" | ")
        setError(allErrors || "Registration failed")
      } else {
        setError("Registration failed. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-mono relative"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-[#0a1628]/70" />

      <div className="relative z-10 w-full max-w-lg bg-[#0d1f3c]/90 backdrop-blur-md p-8 rounded-[2.5rem] border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        
        {/* Cyan glow accent top */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-5 left-6 flex items-center gap-1 text-cyan-400/70 hover:text-cyan-300 font-black italic uppercase text-xs transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="mb-2 leading-tight text-center">
          <span
            className="block text-5xl uppercase"
            style={{
              fontFamily: "'Luckiest Guy', cursive",
              color: "#4aeadc",
              WebkitTextStroke: "2px #0a3d38",
              textShadow: "3px 3px 0 #0a3d38, 6px 6px 0 #041f1c, 0 0 20px rgba(74,234,220,0.4)",
              letterSpacing: "0.05em"
            }}
          >
            Join the
          </span>
          <span
            className="block text-5xl uppercase -mt-1"
            style={{
              fontFamily: "'Luckiest Guy', cursive",
              color: "#ffa733",
              WebkitTextStroke: "2px #7d3a00",
              textShadow: "3px 3px 0 #7d3a00, 6px 6px 0 #3d1c00, 0 0 20px rgba(255,167,51,0.4)",
              letterSpacing: "0.05em"
            }}
          >
            Circle
          </span>
        </h1>
        <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-widest mb-8 text-center">Create your account</p>

        <form onSubmit={onSubmit} className="space-y-5 relative z-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="FIRST NAME"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#071428] text-white placeholder-white/30 px-5 py-4 rounded-2xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none font-bold tracking-wider transition-colors"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="LAST NAME"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#071428] text-white placeholder-white/30 px-5 py-4 rounded-2xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none font-bold tracking-wider transition-colors"
                required
              />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="CHOOSE NICKNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#071428] text-white placeholder-white/30 px-6 py-4 rounded-2xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none font-bold tracking-wider text-center transition-colors"
              required
            />
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#071428] text-white placeholder-white/30 px-6 py-4 rounded-2xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none font-bold tracking-wider text-center transition-colors"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="SECRET PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#071428] text-white placeholder-white/30 px-6 py-4 pr-14 rounded-2xl border-2 border-cyan-500/40 focus:border-cyan-400 outline-none font-bold tracking-wider text-center transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/60 rounded-xl p-3 text-red-300 text-center font-bold uppercase text-xs">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-black italic py-4 rounded-2xl border-2 border-orange-300/40 shadow-[0_6px_0_0_#c2410c] hover:shadow-[0_4px_0_0_#c2410c] transition-all active:translate-y-1 active:shadow-none uppercase tracking-wider text-xl"
          >
            {loading ? "JOINING..." : "Join Tribe"}
          </button>

          <div className="pt-1">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 mb-3">
              <div className="h-px bg-cyan-500/20 flex-1" />
              or
              <div className="h-px bg-cyan-500/20 flex-1" />
            </div>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div className="flex justify-center">
                <div ref={googleBtnRef} />
              </div>
            ) : (
              <div className="text-[10px] text-cyan-400/60 font-bold uppercase tracking-wider text-center">
                Set VITE_GOOGLE_CLIENT_ID to enable Google signup
              </div>
            )}

            {googleLoading && (
              <div className="text-[10px] text-cyan-200/80 font-bold uppercase tracking-wider text-center mt-2">
                Verifying Google account...
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-cyan-500/20 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-cyan-400 hover:text-orange-400 font-black italic uppercase tracking-tighter text-xs transition-colors"
          >
            Already a member? Log in here →
          </button>
        </div>
      </div>
    </div>
  )
}
