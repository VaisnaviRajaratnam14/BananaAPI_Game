import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../utils/api"

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setError("")
        const r = await api.get("leaderboard/")
        setPlayers(r.data)
      } catch (err) {
        console.error("Failed to fetch leaderboard", err)
        setError("Could not load leaderboard. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-[#a8d18d] p-4 md:p-8 font-mono">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-[#5d3a1a] font-black italic uppercase hover:scale-105 transition-transform"
        >
          <span className="text-2xl">←</span> Back
        </button>
        <h1 className="text-[#5d3a1a] text-3xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-sm">
          LEADERBOARD
        </h1>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Leaderboard Card */}
        <div className="bg-[#8b5a2b] p-6 md:p-10 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_15px_0_0_#3d2611] relative overflow-hidden">
          
          {loading ? (
            <div className="text-white text-center font-black italic uppercase text-2xl py-20 animate-pulse">
              Loading Champions...
            </div>
          ) : error ? (
            <div className="text-red-200 text-center font-black italic uppercase text-xl py-20">
              ⚠️ {error}
            </div>
          ) : (
            <div className="space-y-4">
              {players.map((player, index) => {
                const isMe = player.id === user?.id
                const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null

                return (
                  <div 
                    key={player.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-2xl border-4 transition-all
                      ${isMe ? "bg-pink-500 border-white scale-105 shadow-xl z-10" : "bg-[#e8e8e8] border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]"}
                    `}
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 flex items-center justify-center font-black text-2xl ${isMe ? "text-white" : "text-[#8b5a2b]"}`}>
                      {rankIcon || index + 1}
                    </div>

                    {/* Avatar (Simple Circle) */}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${isMe ? "bg-white text-pink-500" : "bg-pink-500 text-white"}`}>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Name and Stats */}
                    <div className="flex-1">
                      <div className={`font-black italic uppercase tracking-tighter text-lg ${isMe ? "text-white" : "text-[#5d3a1a]"}`}>
                        {player.username} {isMe && "(YOU)"}
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? "text-pink-200" : "text-[#8b5a2b]/60"}`}>
                        {player.rank} • Level {player.current_level}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-2xl font-black italic tracking-tighter ${isMe ? "text-white" : "text-[#5d3a1a]"}`}>
                        {player.score}
                      </div>
                      <div className={`text-[8px] font-black uppercase italic ${isMe ? "text-pink-200" : "text-[#8b5a2b]/60"}`}>
                        Total Marks
                      </div>
                    </div>
                  </div>
                )
              })}

              {players.length === 0 && (
                <div className="text-white/60 text-center font-black italic uppercase py-10">
                  No players found yet. Be the first!
                </div>
              )}
            </div>
          )}

          {/* Decorative marks */}
          <div className="absolute top-1/4 left-0 w-4 h-1 bg-[#5d3a1a] opacity-30"></div>
          <div className="absolute bottom-1/3 right-0 w-6 h-1 bg-[#5d3a1a] opacity-30"></div>
        </div>
      </div>
    </div>
  )
}
