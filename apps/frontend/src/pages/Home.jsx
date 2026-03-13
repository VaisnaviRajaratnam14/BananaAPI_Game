import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Home() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()

  useEffect(() => {
    async function fetchStats() {
      if (!token) return
      try {
        const api = withAuth(token)
        const res = await api.get("user/stats/")
        setUser(res.data)
      } catch (err) {
        console.error("Failed to fetch user stats:", err)
      }
    }
    fetchStats()
  }, [token, setUser])
  
  // Django structure: user.profile and user.levels
  const profile = user?.profile || { diamonds: 0, total_marks: 0, rank: "Novice", current_level: 1, gifts: 0 }
  const userLevels = user?.levels || []

  // Helper to get stars for a level
  const getStars = (levelId) => {
    const levelData = userLevels.find(l => l.level_number === levelId)
    return levelData ? levelData.stars_earned : 0
  }

  const levels = [
    { id: 1, pos: { x: 50, y: 1400 }, status: profile.current_level > 1 ? "completed" : profile.current_level === 1 ? "current" : "locked", stars: getStars(1) },
    { id: 2, pos: { x: 30, y: 1200 }, status: profile.current_level > 2 ? "completed" : profile.current_level === 2 ? "current" : "locked", stars: getStars(2) },
    { id: 3, pos: { x: 60, y: 1000 }, status: profile.current_level > 3 ? "completed" : profile.current_level === 3 ? "current" : "locked", stars: getStars(3) },
    { 
      id: 4, 
      pos: { x: 40, y: 800 }, 
      status: (getStars(1) >= 3 && getStars(2) >= 3 && getStars(3) >= 3) 
        ? (profile.current_level > 4 ? "completed" : profile.current_level === 4 ? "current" : "locked")
        : "locked", 
      stars: getStars(4) 
    },
    { id: 5, pos: { x: 70, y: 600 }, status: profile.current_level > 5 ? "completed" : profile.current_level === 5 ? "current" : "locked", stars: getStars(5) },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#050d22] text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-16 bg-[#0a1c3d]/95 border-b border-cyan-500/30 flex items-center px-4 md:px-8 gap-6 z-20">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-cyan-100/80">
          <button className="text-cyan-200 border-b-2 border-orange-500 pb-1">Home</button>
          <button className="hover:text-cyan-200 transition-colors">Learn</button>
          <button className="hover:text-cyan-200 transition-colors">Daily Challenge</button>
          <button onClick={() => navigate("/leaderboard")} className="hover:text-cyan-200 transition-colors">Leaderboard</button>
          <button className="hover:text-cyan-200 transition-colors">Shop</button>
          <button className="hover:text-cyan-200 transition-colors">Community</button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-sm font-bold">
          {/* Diamonds */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/70 border border-cyan-400/40 rounded-full text-cyan-300">
            <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-lg font-black">{profile.diamonds}</span>
          </div>

          {/* Gifts */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-950/40 border border-orange-400/40 rounded-full text-orange-300">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-sm">🎁</span>
            </div>
            <span className="text-lg font-black">{profile.gifts}</span>
          </div>

          {/* User Profile */}
          <div 
            onClick={() => navigate("/account")}
            className="flex items-center gap-3 pl-4 border-l border-cyan-400/30 cursor-pointer group hover:bg-cyan-900/20 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-cyan-500/40 group-hover:border-cyan-300 transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-black uppercase tracking-tight group-hover:text-cyan-300 transition-colors">{user?.username || "Guest"}</span>
              <span className="text-orange-300 text-[10px] font-bold uppercase tracking-widest">{profile.rank}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Level Map Content */}
      <main className="flex-1 relative overflow-y-auto bg-gradient-to-b from-[#07122d] via-[#0a2f5e] to-[#0891b2]">
        <div className="absolute inset-0 flex flex-col items-center py-20 min-h-[1500px]">
          <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 400 1500" preserveAspectRatio="none">
            <path
              d="M 320 1400 Q 240 1300 120 1200 T 80 1000 T 160 800 T 140 600 T 200 400 T 100 200"
              fill="none"
              stroke="#fb923c"
              strokeWidth="40"
              strokeLinecap="round"
              className="opacity-45"
            />
          </svg>

          <div className="relative w-full max-w-md h-full flex flex-col gap-32">
            {[...levels].reverse().map((level) => (
              <div
                key={level.id}
                className="relative flex justify-center"
                style={{ left: `${level.pos.x - 50}%` }}
              >
                <button
                  onClick={() => level.status !== "locked" && navigate("/game", { state: { level: level.id } })}
                  className={`
                    w-20 h-20 rounded-full border-b-8 shadow-xl flex items-center justify-center text-3xl font-black relative transition-all active:scale-95
                    ${level.status === "completed" ? "bg-cyan-400 border-[#0a2f5e] text-[#07122d]" : ""}
                    ${level.status === "current" ? "bg-orange-400 border-orange-600 text-[#07122d] animate-bounce" : ""}
                    ${level.status === "locked" ? "bg-slate-200 border-slate-300 text-slate-400 opacity-80 cursor-not-allowed" : ""}
                  `}
                >
                  {level.id}
                  
                  {level.status !== "locked" && (
                    <div className="absolute -top-10 flex gap-0.5 z-30">
                      {[1, 2, 3].map((star) => (
                        <svg
                          key={star}
                          className={`w-8 h-8 transition-all duration-500 ${
                            star <= level.stars ? "text-orange-300 scale-125 drop-shadow-[0_3px_3px_rgba(0,0,0,0.5)]" : "text-[#07122d]/20"
                          } ${star === 2 ? "-translate-y-1.5" : ""}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}

                  {(level.id === 2 || level.id === 5 || level.id === 8) && (
                    <div className="absolute -right-12 top-0 transform -rotate-12">
                      <div className={`w-12 h-12 rounded-xl border-b-4 flex items-center justify-center ${level.id === 5 ? "bg-cyan-400 border-cyan-600" : "bg-orange-400 border-orange-600"}`}>
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
