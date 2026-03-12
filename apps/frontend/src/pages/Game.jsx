import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { withAuth } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import bananaImg from "../assets/banana.svg"
import bgImage from "../assets/backgroundg.jpg"

export default function Game() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const location = useLocation()
  const levelNo = location.state?.level || 1
  const api = withAuth(token)
  const [puzzle, setPuzzle] = useState(null)
  const [difficulty, setDifficulty] = useState("easy")
  const [mode, setMode] = useState("equations")
  const [answer, setAnswer] = useState("")
  const [seconds, setSeconds] = useState(60) // Start at 1:00 (60s) for "Fast Timer"
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState("")
  const [hint, setHint] = useState("")
  const [selectedMissing, setSelectedMissing] = useState(false)
  const [resultMark, setResultMark] = useState("idle")
  
  // New Level Logic State
  const [puzzleCount, setPuzzleCount] = useState(1) // 1 to 3
  const [attempts, setAttempts] = useState(3) // 3 attempts per puzzle
  const [isGameOver, setIsGameOver] = useState(false)
  const [stars, setStars] = useState(0) // 0, 1, 2, 2.5, 3
  const [hasGift, setHasGift] = useState(false)

  const currentEmoji = attempts === 3 ? "🍌" : "😊"

  useEffect(() => {
    if (token) {
      resetGame()
      loadPuzzle()
    }
  }, [mode, token])

  useEffect(() => {
    let t = null
    if (puzzle && seconds > 0 && !isGameOver) {
      t = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsGameOver(true)
            setStatus("Time's Up!")
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => t && clearInterval(t)
  }, [puzzle, seconds, isGameOver])

  function resetGame() {
    setPuzzleCount(1)
    setAttempts(3)
    setSeconds(60) // Reset to 1:00 (60s)
    setIsGameOver(false)
    setScore(0)
    setStars(0)
    setHasGift(false)
  }

  async function loadPuzzle() {
    try {
      setStatus("")
      setHint("")
      setAnswer("")
      setSelectedMissing(false)
      setResultMark("idle")
      
      // Level < 5: equations (internal), Level >= 5: external (Banana API)
      const targetMode = levelNo >= 5 ? "external" : "equations"
      const r = await api.get("/game/puzzle", { params: { difficulty, mode: targetMode } })
      setPuzzle(r.data)
    } catch (err) {
      setPuzzle(null)
      setStatus("Failed to load puzzle")
      console.error("Load puzzle error", err?.response?.status, err?.response?.data || err?.message)
    }
  }

  async function submit() {
    if (!puzzle || isGameOver) return
    
    const correct = String(puzzle.solution) === String(answer)
    setAnswer("") // Automatically clear the input field after clicking submit
    
    if (correct) {
      setStatus("Correct")
      setResultMark("correct")
      
      // Attempt-based scoring
      let earned = 0
      if (attempts === 3) earned = 50
      else if (attempts === 2) earned = 25
      else if (attempts === 1) earned = 10
      
      const newScore = score + earned
      setScore(newScore)
      await api.post("/game/submit", { puzzleId: puzzle.id, seconds: 60 - seconds, earned })
      
      if (puzzleCount < 3) {
        setTimeout(() => {
          setPuzzleCount(prev => prev + 1)
          setAttempts(3) // Reset attempts for next puzzle
          loadPuzzle()
        }, 1000)
      } else {
        // Calculate stars based on final total score
        let s = 0
        if (newScore >= 140) { s = 3; setHasGift(true) }
        else if (newScore >= 130) s = 2.5
        else if (newScore >= 120) s = 2
        else if (newScore >= 100) s = 1
        
        setStars(s)
        if (s > 0) {
          setStatus("Level Complete!")
          setTimeout(() => {
            navigate("/result", { state: { score: newScore, stars: s, hasGift: newScore >= 140, level: levelNo } })
          }, 1500)
        } else {
          setStatus("Failed! Try Again")
          setIsGameOver(true)
        }
      }
    } else {
      const nextAttempts = attempts - 1
      setAttempts(nextAttempts)
      setResultMark("wrong")
      
      if (nextAttempts > 0) {
        setStatus("Not Correct! Try again.")
      } else {
        setStatus("Not Correct! Out of attempts.")
        // Calculate stars based on current score even if failed this puzzle
        let s = 0
        if (score >= 140) s = 3
        else if (score >= 130) s = 2.5
        else if (score >= 120) s = 2
        else if (score >= 100) s = 1
        
        if (s > 0) {
          setTimeout(() => {
            navigate("/result", { state: { score, stars: s, hasGift: score >= 140, level: levelNo } })
          }, 1500)
        } else {
          setIsGameOver(true)
        }
      }
    }
  }

  function formatTime(s) {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  function revealHint() {
    if (!puzzle) return
    setHint(puzzle.hint || "")
  }

  const grid = useMemo(() => {
    if (!puzzle) return []
    if (puzzle.type === "equations") {
      const out = []
      for (let r = 0; r < puzzle.gridH; r++) {
        const row = []
        for (let c = 0; c < puzzle.gridW; c++) {
          const idx = r * puzzle.gridW + c
          const v = puzzle.tokens[idx]
          const missing = puzzle.missingIndex === idx
          row.push({ v, missing, r, c })
        }
        out.push(row)
      }
      return out
    } else {
      const out = []
      for (let r = 0; r < puzzle.size; r++) {
        const row = []
        for (let c = 0; c < puzzle.size; c++) {
          const idx = r * puzzle.size + c
          const v = puzzle.values[idx]
          const missing = puzzle.missingIndex === idx
          row.push({ v, missing, r, c })
        }
        out.push(row)
      }
      return out
    }
  }, [puzzle])

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Level Number Indicator - Left Side */}
      <div className="absolute left-4 top-24 z-30">
        <div className="bg-[#8b5a2b] border-4 border-[#5d3a1a] rounded-2xl p-3 shadow-[0_4px_0_0_#3d2611] text-white flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-white/60">Level</span>
          <span className="text-4xl font-black italic tracking-tighter">{levelNo}</span>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="h-16 bg-slate-800/90 border-b border-slate-700 flex items-center px-4 md:px-8 gap-6 z-20">
        <div className="flex items-center gap-2 mr-4">
          <button 
            onClick={() => navigate("/home")}
            className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-slate-300">
          <button onClick={() => navigate("/home")} className="hover:text-white transition-colors">Home</button>
          <button className="hover:text-white transition-colors">Learn</button>
          <button className="hover:text-white transition-colors">Daily Challenge</button>
          <button onClick={() => navigate("/leaderboard")} className="hover:text-white transition-colors">Leaderboard</button>
          <button className="hover:text-white transition-colors">Shop</button>
          <button className="hover:text-white transition-colors">Community</button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-sm font-bold">
          {/* Diamonds */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e2a26] border border-[#1d4d46] rounded-full text-[#22c55e]">
            <div className="w-7 h-7 bg-[#22c55e] rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-lg font-black">{user?.stats?.diamonds || 0}</span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2118] border border-[#4d3a2a] rounded-full text-[#f97316]">
            <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-[#2a2118]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-black">{user?.stats?.energy || 0}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a1a1e] border border-[#4d262a] rounded-full text-[#ef4444]">
            <div className="w-7 h-7 bg-[#ef4444] rounded-lg flex items-center justify-center shadow-lg bg-opacity-20">
              <svg className="w-5 h-5 text-[#ef4444]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.414-.914c-1.032.479-1.818 1.42-2.115 2.503-.16.588-.223 1.159-.223 1.64 0 2.445 1.556 4.605 3.703 5.19a7.003 7.003 0 018.674-6.2c-.185-.345-.453-.652-.782-.923a.997.997 0 01-.314-.733c0-.146.02-.294.06-.437.056-.204.19-.46.339-.735.148-.274.312-.574.441-.873.13-.3.213-.6.213-.862a1 1 0 00-.601-.91zM14.93 18.84a4.996 4.996 0 01-3.015-1.815 1.1 1.1 0 01.011-1.408 1.1 1.1 0 011.405-.011 2.992 2.992 0 004.108-.209 1.1 1.1 0 011.558 1.556 4.993 4.993 0 01-4.067 1.887z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-black">{user?.stats?.streak || 0}</span>
          </div>

          {/* Gifts */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a18] border border-[#4d4d2a] rounded-full text-[#fbbf24]">
            <div className="w-7 h-7 bg-[#fbbf24] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-sm">🎁</span>
            </div>
            <span className="text-lg font-black">{user?.stats?.gifts || 0}</span>
          </div>

          {/* User Profile */}
          <div 
            onClick={() => navigate("/account")}
            className="flex items-center gap-3 pl-4 border-l border-slate-700 cursor-pointer group hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-600 group-hover:border-white transition-colors">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-black uppercase tracking-tight group-hover:text-pink-400 transition-colors">{user?.username || "Guest"}</span>
              <span className="text-pink-500 text-[10px] font-bold uppercase tracking-widest">{user?.stats?.rank || "Novice"}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="border-beam rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
          <div className="bg-white p-4 md:p-6 min-h-[400px] flex flex-col">
            
            {/* Header section matching the image */}
            <div className="mb-4">
              <div className="flex justify-end items-start">
                {/* Timer Box */}
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-3xl md:text-5xl font-bold px-6 py-2 rounded-2xl shadow-lg min-w-[140px] text-center">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            {/* Puzzle Progress and Attempts */}
            <div className="flex justify-between items-center mb-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <div>Puzzle {puzzleCount} / 3</div>
              <div className="flex gap-2 items-center">
                <span>Attempts:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${i <= attempts ? "bg-red-500" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* The Grid area */}
            <div className="flex-1 flex items-center justify-center my-4">
              {puzzle?.type === "external" && (
                <div className="w-full max-w-lg bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                  <img src={puzzle.question} alt="Banana Puzzle" className="w-full h-auto object-contain" />
                </div>
              )}

              {puzzle?.type === "equations" && (
                <div 
                  className="grid gap-0 bg-white border border-gray-100 shadow-sm" 
                  style={{ 
                    gridTemplateColumns: `repeat(${puzzle.gridW}, minmax(40px, 1fr))`,
                    maxWidth: "600px",
                    width: "100%"
                  }}
                >
                  {grid.map((row, ri) =>
                    row.map((cell, ci) => {
                      const isOp = ["+", "=", "x", "×", "-", "−", "÷"].includes(cell.v)
                      
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`
                            aspect-square flex items-center justify-center text-2xl md:text-4xl font-bold border-[0.5px] border-gray-100
                            ${cell.missing && selectedMissing ? "bg-yellow-50/50" : ""}
                          `}
                          onClick={() => { if (cell.missing) setSelectedMissing(true) }}
                        >
                          {isOp ? (
                            <div className="text-red-500">{cell.v}</div>
                          ) : (
                            <div className="text-blue-600 tracking-[0.5em] flex items-center justify-center w-full">
                              {cell.v.split("").map((digit, di) => {
                                const isMissingDigit = cell.missing && di === puzzle.digitIndex
                                return (
                                  <span key={di} className="relative inline-flex items-center justify-center">
                                    {isMissingDigit ? (
                                      <span className="text-3xl md:text-4xl animate-pulse mx-[-0.1em]">{currentEmoji}</span>
                                    ) : (
                                      digit
                                    )}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            {/* Result Display */}
            <div className="mt-auto pt-4 text-left">
              {isGameOver && stars > 0 && (
                <div className="flex flex-col items-center mb-6 animate-bounce">
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3].map(i => {
                      const isFull = i <= Math.floor(stars)
                      const isHalf = i === Math.ceil(stars) && stars % 1 !== 0
                      return (
                        <div key={i} className="text-4xl md:text-6xl text-yellow-400">
                          {isFull ? "⭐" : isHalf ? "🌗" : "☆"}
                        </div>
                      )
                    })}
                  </div>
                  {hasGift && (
                    <div className="text-5xl animate-pulse mt-2" title="You got a gift!">🎁</div>
                  )}
                </div>
              )}

              {status && (
                <div className={`mb-4 text-xl font-bold italic ${status==="Correct" || status==="Level Complete!" ? "text-green-600" : "text-black"}`}>
                  {status}!
                </div>
              )}

              <div className="text-lg font-bold text-black mb-3 italic">Quest is ready.</div>
              
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="text-base font-bold text-black flex items-center gap-2">
                  Enter the missing digit:
                  <input
                    inputMode="numeric"
                    value={answer}
                    onChange={e=>setAnswer(e.target.value.replace(/\D/g,""))}
                    className="w-16 h-10 text-xl text-center rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold border-none shadow-sm focus:ring-4 ring-orange-200 outline-none"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-2 ml-auto">
                  <button onClick={revealHint} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg text-xs transition-colors">Hint</button>
                  <button onClick={submit} className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xs shadow-md transition-all active:scale-95">Submit</button>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        if (puzzleCount > 1) {
                          setPuzzleCount(p => p - 1)
                          setAttempts(3)
                          loadPuzzle()
                        }
                      }} 
                      disabled={puzzleCount <= 1}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 font-bold rounded-lg text-lg transition-colors leading-none"
                      title="Previous Puzzle"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => {
                        if (puzzleCount < 3) {
                          setPuzzleCount(p => p + 1)
                          setAttempts(3)
                          loadPuzzle()
                        }
                      }} 
                      disabled={puzzleCount >= 3}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 font-bold rounded-lg text-lg transition-colors leading-none"
                      title="Next Puzzle"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Total Score: {score}</span>
                {isGameOver && (
                  <button 
                    onClick={resetGame} 
                    className="text-blue-600 hover:underline font-black"
                  >
                    Play Again
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
