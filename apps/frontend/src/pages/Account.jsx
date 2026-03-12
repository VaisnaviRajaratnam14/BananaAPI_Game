import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Account() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const stats = user?.stats || { diamonds: 0, score: 0, streak: 0, rank: "Novice", level: 1, gifts: 0 }

  return (
    <div className="min-h-screen bg-[#a8d18d] p-4 md:p-8 font-mono">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/home")}
        className="mb-6 flex items-center gap-2 text-[#5d3a1a] font-black italic uppercase hover:scale-105 transition-transform"
      >
        <span className="text-2xl">←</span> Back to Map
      </button>

      <div className="max-w-2xl mx-auto">
        {/* Profile Card (Cartoon Wood Style) */}
        <div className="bg-[#8b5a2b] p-8 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_15px_0_0_#3d2611] relative overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b-4 border-[#5d3a1a]/30">
            <div className="w-24 h-24 bg-pink-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-white text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">
                {user?.username || "GUEST"}
              </h1>
              <p className="text-pink-400 text-xl font-bold italic uppercase tracking-widest">
                {stats.rank}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
              <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Full Name</span>
              <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                {user?.firstName || "NOT"} {user?.lastName || "SET"}
              </span>
            </div>
            <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
              <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Email Address</span>
              <span className="text-[#5d3a1a] text-lg font-black italic uppercase truncate">
                {user?.identifier || "N/A"}
              </span>
            </div>
            <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
              <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Current Level</span>
              <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                Level {stats.level}
              </span>
            </div>
            <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
              <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Total Score</span>
              <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                {stats.score} Points
              </span>
            </div>
          </div>

          {/* Stats Bar (Secondary Theme) */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-xl border-4 border-emerald-700 shadow-[0_4px_0_0_#047857] text-white font-black italic">
              <span>💎</span> {stats.diamonds}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 rounded-xl border-4 border-orange-700 shadow-[0_4px_0_0_#c2410c] text-white font-black italic">
              <span>⚡</span> {stats.energy || 0}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500 rounded-xl border-4 border-rose-700 shadow-[0_4px_0_0_#be123c] text-white font-black italic">
              <span>🔥</span> {stats.streak}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-xl border-4 border-yellow-700 shadow-[0_4px_0_0_#a16207] text-white font-black italic">
              <span>🎁</span> {stats.gifts || 0}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/setup")}
              className="w-full bg-[#4ba334] hover:bg-[#5bbd41] text-white font-black italic py-4 rounded-2xl border-4 border-[#2d661e] shadow-[0_6px_0_0_#2d661e] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#2d661e] uppercase"
            >
              Change Username
            </button>
            <button
              onClick={() => { logout(); navigate("/login") }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black italic py-4 rounded-2xl border-4 border-red-800 shadow-[0_6px_0_0_#991b1b] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#991b1b] uppercase"
            >
              Logout Account
            </button>
          </div>

          {/* Decorative Cracks */}
          <div className="absolute top-1/4 left-0 w-4 h-1 bg-[#5d3a1a] opacity-30"></div>
          <div className="absolute bottom-1/3 right-0 w-6 h-1 bg-[#5d3a1a] opacity-30"></div>
        </div>
      </div>
    </div>
  )
}
