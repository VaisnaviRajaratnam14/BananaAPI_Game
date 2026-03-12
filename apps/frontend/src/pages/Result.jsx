import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, setUser } = useAuth()
  const api = withAuth(token)
  
  const { score = 0, stars = 0, hasGift = false, level = 1 } = location.state || {}
  const [collected, setCollected] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCollect() {
    if (collected || loading) return
    setLoading(true)
    try {
      // Logic: 1 star = 10 diamonds, Gift = 50 diamonds + 1 gift count
      const diamondsEarned = Math.floor(stars * 10) + (hasGift ? 50 : 0)
      const giftsEarned = hasGift ? 1 : 0
      
      const r = await api.post("/auth/collect", { 
        diamonds: diamondsEarned, 
        gifts: giftsEarned,
        level,
        stars
      })
      
      setUser(r.data)
      setCollected(true)
      
      // Auto-navigate back to home after collection
      setTimeout(() => {
        navigate("/home")
      }, 1500)
    } catch (err) {
      console.error("Collection error", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#a8d18d] flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-lg bg-[#8b5a2b] p-10 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_20px_0_0_#3d2611] text-center relative overflow-hidden">
        
        {/* Decorative cracks */}
        <div className="absolute top-10 left-0 w-4 h-1 bg-[#5d3a1a] opacity-30"></div>
        <div className="absolute top-20 right-0 w-6 h-1 bg-[#5d3a1a] opacity-30"></div>

        <h1 className="text-white text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-8 drop-shadow-lg">
          LEVEL COMPLETE!
        </h1>

        {/* Stars Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => {
            const isFull = i <= Math.floor(stars)
            const isHalf = i === Math.ceil(stars) && stars % 1 !== 0
            return (
              <div key={i} className="text-6xl md:text-8xl drop-shadow-[0_5px_0_rgba(0,0,0,0.2)] animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                {isFull ? "⭐" : isHalf ? "🌗" : "☆"}
              </div>
            )
          })}
        </div>

        {/* Score Card */}
        <div className="bg-[#e8e8e8] p-6 rounded-3xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)] mb-8">
          <div className="text-[#8b5a2b] text-sm font-black uppercase italic mb-1">TOTAL MARKS</div>
          <div className="text-[#5d3a1a] text-5xl font-black italic tracking-tighter">
            {score}
          </div>
        </div>

        {/* Gift Box Section */}
        {hasGift && (
          <div className="mb-10 group">
            <div className="text-white text-sm font-black uppercase italic mb-2">BONUS REWARD UNLOCKED!</div>
            <div className="text-7xl animate-pulse cursor-pointer transition-transform group-hover:scale-110">🎁</div>
          </div>
        )}

        {/* Collect Button */}
        <button
          onClick={handleCollect}
          disabled={collected || loading}
          className={`w-full ${collected ? "bg-slate-500" : "bg-[#4ba334] hover:bg-[#5bbd41]"} text-white font-black italic py-6 rounded-3xl border-4 ${collected ? "border-slate-700" : "border-[#2d661e]"} shadow-[0_8px_0_0_rgba(0,0,0,0.2)] transition-all active:translate-y-1 active:shadow-[0_4px_0_0_rgba(0,0,0,0.2)] uppercase tracking-wider text-2xl md:text-3xl`}
        >
          {loading ? "COLLECTING..." : collected ? "COLLECTED! ✓" : "COLLECT REWARDS"}
        </button>

        {/* Home link if they don't want to collect (though they should) */}
        {!collected && (
          <button 
            onClick={() => navigate("/home")}
            className="mt-6 text-white/60 hover:text-white font-black italic uppercase text-xs"
          >
            Skip rewards and go back →
          </button>
        )}
      </div>
    </div>
  )
}
