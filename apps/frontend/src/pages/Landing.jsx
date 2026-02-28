import React from "react"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass p-10 rounded-3xl max-w-xl text-center">
        <div className="text-5xl font-extrabold text-banana-dark mb-4 animate-pulse">Welcome</div>
        <div className="text-lg text-black/70 mb-8">A modern banana-themed math puzzle</div>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl bg-banana text-black font-semibold hover:bg-banana-dark transition"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
