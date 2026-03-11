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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/register", { 
        mode: "email", 
        identifier, 
        password,
        firstName,
        lastName
      })
      
      const r = await api.post("/auth/login", { mode: "email", identifier, password, remember: true })
      sessionStorage.setItem("loginTokenId", r.data.loginTokenId)
      sessionStorage.setItem("loginMode", "email")
      navigate("/otp")
    } catch (err) {
      setError(err?.response?.data?.error === "exists" ? "Account already exists" : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#a8d18d] p-4 font-mono">
      {/* Cartoon Wood Container */}
      <div className="relative w-full max-w-lg bg-[#8b5a2b] p-8 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_20px_0_0_#3d2611] overflow-visible">
        
        {/* Close Button Style Circle */}
        <div 
          onClick={() => navigate("/")}
          className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 transition-colors z-10"
        >
          <span className="text-white text-2xl font-bold">×</span>
        </div>

        {/* Decorative cracks/marks */}
        <div className="absolute top-10 left-0 w-4 h-1 bg-[#5d3a1a] opacity-30"></div>
        <div className="absolute top-20 right-0 w-6 h-1 bg-[#5d3a1a] opacity-30"></div>
        <div className="absolute bottom-20 left-0 w-5 h-1 bg-[#5d3a1a] opacity-30"></div>

        <form onSubmit={onSubmit} className="space-y-6 relative z-0">
          {/* Name Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="FIRST NAME"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                className="w-full bg-[#e8e8e8] text-[#5d3a1a] placeholder-[#8b5a2b]/50 px-6 py-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] outline-none font-black italic tracking-tighter"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="LAST NAME"
                value={lastName}
                onChange={(e) => setLastName(e.target.value.toUpperCase())}
                className="w-full bg-[#e8e8e8] text-[#5d3a1a] placeholder-[#8b5a2b]/50 px-6 py-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] outline-none font-black italic tracking-tighter"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="EMAIL"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-[#e8e8e8] text-[#5d3a1a] placeholder-[#8b5a2b]/50 px-6 py-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] outline-none font-black italic tracking-tighter"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#e8e8e8] text-[#5d3a1a] placeholder-[#8b5a2b]/50 px-6 py-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] outline-none font-black italic tracking-tighter"
              required
            />
          </div>

          {/* Terms text */}
          <p className="text-white text-[10px] md:text-xs text-center font-bold italic leading-tight uppercase px-4">
            By clicking below to sign up, you are agreeing to our terms of service and privacy policy
          </p>

          {error && <p className="text-red-300 text-center font-bold text-xs">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4ba334] hover:bg-[#5bbd41] disabled:opacity-50 text-white font-black italic py-5 rounded-3xl border-4 border-[#2d661e] shadow-[0_8px_0_0_#2d661e] transition-all active:translate-y-1 active:shadow-[0_4px_0_0_#2d661e] uppercase tracking-wider text-xl md:text-2xl"
          >
            {loading ? "WAITING..." : "Create my account"}
          </button>
        </form>
      </div>
    </div>
  )
}
      )}
    </div>
  )
}
