import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Home() {
  const navigate = useNavigate()
  const { user, token, setUser } = useAuth()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate("/dashboard")
  }

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

  const levelPoints = [
    { id: 1, x: 8, y: 76 },
    { id: 2, x: 20, y: 64 },
    { id: 3, x: 34, y: 70 },
    { id: 4, x: 47, y: 58 },
    { id: 5, x: 61, y: 65 },
    { id: 6, x: 74, y: 52 },
    { id: 7, x: 86, y: 59 },
    { id: 8, x: 74, y: 36 },
    { id: 9, x: 58, y: 29 },
    { id: 10, x: 89, y: 18 },
  ]

  const levels = levelPoints.map((point) => ({
    ...point,
    status:
      profile.current_level > point.id
        ? "completed"
        : profile.current_level === point.id
          ? "current"
          : "locked",
    stars: getStars(point.id),
  }))

  const maxLevelId = levels[levels.length - 1]?.id || 1
  const heroLevelId = Math.min(profile.current_level || 1, maxLevelId)
  const heroLevel = levels.find((l) => l.id === heroLevelId) || levels[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#050d22] text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-16 bg-[#050d22]/70 backdrop-blur-md border-b border-cyan-400/25 flex items-center px-4 md:px-8 gap-6 z-20">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mr-4 hover:scale-110 transition-transform"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
        </button>

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
      <main className="flex-1 relative overflow-hidden min-h-[620px] bg-[radial-gradient(circle_at_50%_40%,#2c64d2_0%,#1b2d8d_33%,#1a1067_62%,#120644_100%)]">
        <div className="absolute inset-0">
          {[...Array(45)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/80"
              style={{
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                left: `${(i * 17) % 100}%`,
                top: `${(i * 29) % 100}%`,
                opacity: 0.35 + ((i % 5) * 0.12),
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_75%,rgba(34,211,238,0.3),transparent_45%),radial-gradient(circle_at_82%_22%,rgba(168,85,247,0.35),transparent_40%)]" />

        <div className="relative z-10 w-full h-[calc(100vh-64px)] min-h-[620px] px-2 md:px-6 py-8">
          <div className="mx-auto w-full max-w-7xl h-full rounded-[24px] border border-cyan-300/20 bg-white/5 backdrop-blur-[1px] overflow-hidden relative">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 8 76 C 12 71, 16 65, 20 64 C 25 63, 29 69, 34 70 C 40 71, 43 60, 47 58 C 53 55, 56 66, 61 65 C 67 64, 70 54, 74 52 C 80 49, 83 60, 86 59 C 84 51, 80 42, 74 36 C 68 32, 62 30, 58 29 C 70 27, 80 22, 89 18"
                fill="none"
                stroke="rgba(167,139,250,0.65)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M 8 76 C 12 71, 16 65, 20 64 C 25 63, 29 69, 34 70 C 40 71, 43 60, 47 58 C 53 55, 56 66, 61 65 C 67 64, 70 54, 74 52 C 80 49, 83 60, 86 59 C 84 51, 80 42, 74 36 C 68 32, 62 30, 58 29 C 70 27, 80 22, 89 18"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.35"
                strokeDasharray="0.3 1.1"
                strokeLinecap="round"
              />
            </svg>

            <div
              className="absolute z-20 pointer-events-none transition-all duration-700 ease-out -translate-x-1/2 -translate-y-[82%]"
              style={{ left: `${heroLevel.x}%`, top: `${heroLevel.y}%` }}
            >
              <div className="absolute left-1/2 top-[84%] -translate-x-1/2 w-[104px] h-[30px] rounded-[999px] bg-[linear-gradient(180deg,#696a87_0%,#2d2d48_100%)] border border-cyan-200/35 shadow-[inset_0_2px_0_rgba(255,255,255,0.22),0_8px_16px_rgba(0,0,0,0.45)]" />
              <div className="relative text-[76px] md:text-[106px] drop-shadow-[0_0_22px_rgba(255,255,255,0.45)] select-none animate-pulse">🤖</div>
            </div>

            {levels.map((level) => (
              <div
                key={level.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${level.x}%`, top: `${level.y}%` }}
              >
                <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 w-[88px] h-[30px] rounded-[999px] bg-[linear-gradient(180deg,#5a5a78_0%,#30304e_100%)] border border-cyan-300/20 shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_8px_16px_rgba(0,0,0,0.45)]" />

                <button
                  onClick={() => level.status !== "locked" && navigate("/game", { state: { level: level.id } })}
                  className={`relative z-10 w-[58px] h-[58px] rounded-full flex items-center justify-center text-[30px] font-black transition-transform duration-200 active:scale-95 ${
                    level.status === "locked"
                      ? "bg-[#7b4dbb] text-white/75 border-4 border-white/35 cursor-not-allowed"
                      : "bg-[linear-gradient(180deg,#ffba33_0%,#ff8f1f_100%)] text-white border-4 border-[#ffe2a8] shadow-[0_0_18px_rgba(255,165,0,0.65)] hover:scale-105"
                  }`}
                >
                  {level.id}
                </button>

                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-[2px]">
                  {[1, 2, 3].map((star) => (
                    <span
                      key={star}
                      className={`text-[18px] leading-none ${star === 2 ? "-translate-y-[4px]" : ""} ${
                        star <= Math.round(level.stars)
                          ? "text-orange-300 drop-shadow-[0_0_6px_rgba(253,186,116,0.9)]"
                          : "text-slate-300/50"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
