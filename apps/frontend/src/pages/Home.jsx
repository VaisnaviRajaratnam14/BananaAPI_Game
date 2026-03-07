import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const stats = user?.stats || { diamonds: 500, score: 0, streak: 0, rank: "Novice" }

  const levels = [
    { id: 1, status: "completed", stars: 3, pos: { x: 80, y: 90 } },
    { id: 2, status: "completed", stars: 2, pos: { x: 60, y: 80 } },
    { id: 3, status: "completed", stars: 3, pos: { x: 30, y: 70 } },
    { id: 4, status: "current", stars: 0, pos: { x: 20, y: 55 } },
    { id: 5, status: "locked", stars: 0, pos: { x: 40, y: 45 } },
    { id: 6, status: "locked", stars: 0, pos: { x: 35, y: 30 } },
    { id: 7, status: "locked", stars: 0, pos: { x: 50, y: 20 } },
    { id: 8, status: "locked", stars: 0, pos: { x: 25, y: 10 } },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-16 bg-slate-800 border-b border-slate-700 flex items-center px-4 md:px-8 gap-6 z-20">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-slate-300">
          <button className="text-white border-b-2 border-pink-500 pb-1">Home</button>
          <button className="hover:text-white transition-colors">Learn</button>
          <button className="hover:text-white transition-colors">Daily Challenge</button>
          <button className="hover:text-white transition-colors">Leaderboard</button>
          <button className="hover:text-white transition-colors">Shop</button>
          <button className="hover:text-white transition-colors">Community</button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-sm font-bold">
          {/* Diamonds */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
            <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l1.992 3.985 4.39.638a1 1 0 01.554 1.706l-3.177 3.097.75 4.373a1 1 0 01-1.451 1.054L10 15.347l-3.961 2.081a1 1 0 01-1.451-1.054l.75-4.373-3.177-3.097a1 1 0 01.554-1.706l4.39-.638 1.992-3.985A1 1 0 0110 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span>{stats.diamonds}</span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span>{stats.energy}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.414-.914c-1.032.479-1.818 1.42-2.115 2.503-.16.588-.223 1.159-.223 1.64 0 2.445 1.556 4.605 3.703 5.19a7.003 7.003 0 018.674-6.2c-.185-.345-.453-.652-.782-.923a.997.997 0 01-.314-.733c0-.146.02-.294.06-.437.056-.204.19-.46.339-.735.148-.274.312-.574.441-.873.13-.3.213-.6.213-.862a1 1 0 00-.601-.91zM14.93 18.84a4.996 4.996 0 01-3.015-1.815 1.1 1.1 0 01.011-1.408 1.1 1.1 0 011.405-.011 2.992 2.992 0 004.108-.209 1.1 1.1 0 011.558 1.556 4.993 4.993 0 01-4.067 1.887z" clipRule="evenodd" />
            </svg>
            <span>{stats.streak}</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-600">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-black uppercase tracking-tight">{user?.username || "Guest"}</span>
              <span className="text-pink-500 text-[10px] font-bold uppercase tracking-widest">{stats.rank}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Level Map Content */}
      <main className="flex-1 relative overflow-y-auto bg-sky-300">
        <div className="absolute inset-0 flex flex-col items-center py-20 min-h-[1500px]">
          {/* Curved Path Overlay (Conceptual) */}
          <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 400 1500" preserveAspectRatio="none">
            <path
              d="M 320 1400 Q 240 1300 120 1200 T 80 1000 T 160 800 T 140 600 T 200 400 T 100 200"
              fill="none"
              stroke="white"
              strokeWidth="40"
              strokeLinecap="round"
              className="opacity-40"
            />
          </svg>

          {/* Levels along the path */}
          <div className="relative w-full max-w-md h-full flex flex-col gap-32">
            {levels.reverse().map((level) => (
              <div
                key={level.id}
                className="relative flex justify-center"
                style={{ left: `${level.pos.x - 50}%` }}
              >
                {/* Level Node */}
                <button
                  onClick={() => level.status !== "locked" && navigate("/game")}
                  className={`
                    w-20 h-20 rounded-full border-b-8 shadow-xl flex items-center justify-center text-3xl font-black relative transition-all active:scale-95
                    ${level.status === "completed" ? "bg-sky-400 border-sky-600 text-white" : ""}
                    ${level.status === "current" ? "bg-white border-slate-200 text-sky-500 animate-bounce" : ""}
                    ${level.status === "locked" ? "bg-slate-200 border-slate-300 text-slate-400 opacity-80 cursor-not-allowed" : ""}
                  `}
                >
                  {level.id}
                  
                  {/* Stars Overlay */}
                  {level.status === "completed" && (
                    <div className="absolute -top-6 flex gap-1">
                      {[1, 2, 3].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= level.stars ? "text-yellow-400" : "text-slate-300 opacity-50"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}

                  {/* Gift Box Indicator */}
                  {(level.id === 2 || level.id === 5 || level.id === 8) && (
                    <div className="absolute -right-12 top-0 transform -rotate-12">
                      <div className={`w-12 h-12 rounded-xl border-b-4 flex items-center justify-center ${level.id === 5 ? "bg-green-400 border-green-600" : "bg-orange-400 border-orange-600"}`}>
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
