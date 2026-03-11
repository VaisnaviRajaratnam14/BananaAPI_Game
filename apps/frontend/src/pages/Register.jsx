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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    
    // Comprehensive password validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isCommonPattern = /123456|password|qwerty/i.test(password)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (!hasUpperCase || !hasLowerCase) {
      setError("Include both uppercase and lowercase letters")
      return
    }
    if (!hasSpecialChar) {
      setError("Include at least one special character")
      return
    }
    if (isCommonPattern) {
      setError("Avoid common password patterns")
      return
    }

    setLoading(true)
    try {
      // Normalize identifier (email) to lowercase
      const normalizedIdentifier = identifier.toLowerCase()
      await api.post("/auth/register", { 
        mode: "email", 
        identifier: normalizedIdentifier, 
        password,
        firstName,
        lastName
      })
      
      // Navigate to login page after successful registration
      navigate("/login")
    } catch (err) {
      const serverError = err?.response?.data?.error
      if (serverError === "exists") setError("Account already exists!")
      else if (serverError === "weak_password") setError("Password is too weak!")
      else if (serverError === "invalid") setError("Invalid data provided!")
      else if (!err.response) setError("Server is unreachable! Please check your connection.")
      else setError(`Error: ${err.response.status} - Registration failed.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#a8d18d] p-4 font-mono">
      {/* Cartoon Wood Container */}
      <div className="relative w-full max-w-lg bg-[#8b5a2b] p-8 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_20px_0_0_#3d2611] overflow-visible">
        
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#e8e8e8] text-[#5d3a1a] placeholder-[#8b5a2b]/50 px-6 py-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] outline-none font-black italic tracking-tighter pr-16"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5d3a1a] hover:text-[#8b5a2b] transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.399 8.049 7.21 5 12 5c4.79 0 8.601 3.049 9.964 7.322a1.012 1.012 0 0 1 0 .644C20.601 15.951 16.79 19 12 19c-4.79 0-8.601-3.049-9.964-7.322Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
          </div>

          {/* Terms text */}
          <p className="text-white text-[10px] md:text-xs text-center font-bold italic leading-tight uppercase px-4">
            By clicking below to sign up, you are agreeing to our terms of service and privacy policy
          </p>

          {/* Error Message with Better Visibility */}
          {error && (
            <div className="bg-red-600/20 border-2 border-red-500 rounded-xl p-3 text-red-200 text-center font-black italic uppercase text-xs animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4ba334] hover:bg-[#5bbd41] disabled:opacity-50 text-white font-black italic py-5 rounded-3xl border-4 border-[#2d661e] shadow-[0_8px_0_0_#2d661e] transition-all active:translate-y-1 active:shadow-[0_4px_0_0_#2d661e] uppercase tracking-wider text-xl md:text-2xl"
          >
            {loading ? "WAITING..." : "Create my account"}
          </button>

          {/* Back to Home & Login Links */}
          <div className="flex justify-between items-center mt-4 px-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-white/70 hover:text-white font-black italic uppercase tracking-tighter text-[10px] transition-colors"
            >
              ← Back to Home
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white/70 hover:text-white font-black italic uppercase tracking-tighter text-[10px] transition-colors"
            >
              Already registered? Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
