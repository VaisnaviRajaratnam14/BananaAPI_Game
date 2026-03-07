import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { withAuth } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import bananaImg from "../assets/banana.svg"
import bgImage from "../assets/backgroundg.jpg"

export default function Game() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const api = withAuth(token)
  const [puzzle, setPuzzle] = useState(null)
  const [difficulty, setDifficulty] = useState("easy")
  const [mode, setMode] = useState("equations")
  const [answer, setAnswer] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState("")
  const [hint, setHint] = useState("")
  const [selectedMissing, setSelectedMissing] = useState(false)
  const [resultMark, setResultMark] = useState("idle")

  useEffect(() => {
    if (token) loadPuzzle()
  }, [mode, token])

  useEffect(() => {
    let t = null
    if (puzzle) t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => t && clearInterval(t)
  }, [puzzle])

  async function loadPuzzle() {
    try {
      setStatus("")
      setHint("")
      setAnswer("")
      setSeconds(0)
      setSelectedMissing(false)
      setResultMark("idle")
      const r = await api.get("/game/puzzle", { params: { difficulty, mode } })
      setPuzzle(r.data)
    } catch (err) {
      setPuzzle(null)
      setStatus("Failed to load puzzle")
      // eslint-disable-next-line no-console
      console.error("Load puzzle error", err?.response?.status, err?.response?.data || err?.message)
    }
  }

  async function submit() {
    if (!puzzle) return
    const correct = String(puzzle.solution) === String(answer)
    setStatus(correct ? "Correct" : "Not Correct")
    setResultMark(correct ? "correct" : "wrong")
    if (correct) {
      const earned = Math.max(10, 100 - seconds)
      setScore(s => s + earned)
      await api.post("/game/submit", { puzzleId: puzzle.id, seconds, earned })
      setTimeout(loadPuzzle, 600)
    }
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
    <div className="min-h-screen relative" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {/* Back Button in Corner */}
      <button 
        onClick={() => navigate("/dashboard")} 
        className="absolute top-4 left-4 px-4 py-2 bg-white/80 hover:bg-white rounded-lg shadow-sm font-semibold text-banana-dark z-20 flex items-center gap-2"
      >
        <span>←</span> Back
      </button>

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="border-beam rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
          <div className="bg-white p-4 md:p-6 min-h-[400px] flex flex-col">
            
            {/* Header section matching the image */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-4xl font-bold text-blue-600 mb-1">The Banana Game</h1>
              <div className="flex gap-10 items-center text-red-800/60 font-serif text-sm">
                <span>Six Equations</span>
                <span>www.sanfoh.com</span>
              </div>
            </div>

            {/* The Grid area */}
            <div className="flex-1 flex items-center justify-center my-4">
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
                                      <img src={bananaImg} alt="?" className="w-8 h-8 md:w-10 md:h-10 animate-pulse mx-[-0.2em]" />
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

            {/* Footer section matching the image */}
            <div className="mt-auto pt-4 text-left">
              {status && (
                <div className={`mb-4 text-xl font-bold italic ${status==="Correct" ? "text-green-600" : "text-black"}`}>
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
                  <button onClick={loadPuzzle} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs transition-colors">New Puzzle</button>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Timer: {seconds}s</span>
                <span>Score: {score}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
