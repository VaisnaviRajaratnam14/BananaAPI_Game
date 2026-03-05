import React, { useEffect, useMemo, useState } from "react"
import { withAuth } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import bananaImg from "../assets/banana.svg"
import bgImage from "../assets/backgroundg.jpg"

export default function Game() {
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
    setStatus(correct ? "Correct" : "Wrong")
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
    <div className="worksheet" style={{ paddingTop: "4rem", minHeight: "100vh", backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="border-beam rounded-2xl" style={{ width: "100%", maxWidth: 860 }}>
          <div className="rounded-2xl" style={{ padding: "24px", background: "rgba(255,255,255,0.9)" }}>
          <div className="title-classic">The Banana Game</div>
          <div className="subtitle-classic">Six Equations</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={mode} onChange={e=>setMode(e.target.value)} className="input-classic">
                <option value="equations">Six Equations</option>
                <option value="three">3-Digit Find</option>
                <option value="">Classic Grid</option>
              </select>
              <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="input-classic">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button onClick={loadPuzzle} className="btn-classic">New Puzzle</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {puzzle?.type === "equations" && (
              <div className="eq-grid" style={{ gridTemplateColumns: `repeat(${puzzle.gridW}, 64px)` }}>
                {grid.map((row, ri) =>
                  row.map((cell, ci) => {
                    const idx = ri * puzzle.gridW + ci
                    const isOp = ["+", "=", "x", "×", "-", "−"].includes(cell.v)
                    const classes = ["eq-cell"]
                    if (ci === puzzle.gridW - 1) classes.push("last-col")
                    if (ri === puzzle.gridH - 1) classes.push("last-row")
                    if (cell.missing && selectedMissing) classes.push("eq-selected")
                    if (cell.missing && resultMark === "correct") classes.push("eq-correct")
                    if (cell.missing && resultMark === "wrong") classes.push("eq-wrong")
                    return (
                      <div
                        key={`${ri}-${ci}`}
                        className={classes.join(" ")}
                        onClick={() => { if (cell.missing) setSelectedMissing(true) }}
                      >
                        {cell.missing ? (
                          <div className="banana-cell"><img src={bananaImg} alt="" /></div>
                        ) : isOp ? (
                          <div className="eq-op">{cell.v}</div>
                        ) : (
                          <div className="eq-number">{cell.v}</div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div>Timer {seconds}s</div>
            <div>Score {score}</div>
            <button onClick={revealHint} className="btn-classic">Hint</button>
            <button onClick={submit} className="btn-classic">Submit</button>
          </div>
          <div style={{ marginTop: 8 }}>{hint}</div>
          <div style={{ marginTop: 12, fontSize: 18 }}>Quest is ready.</div>
          {puzzle?.type === "equations" && (
            <div style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 6 }}>Enter the missing digit:</div>
              <input
                inputMode="numeric"
                value={answer}
                onChange={e=>setAnswer(e.target.value.replace(/\D/g,""))}
                className="input-classic"
                style={{ width: 120 }}
              />
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
  )
}
