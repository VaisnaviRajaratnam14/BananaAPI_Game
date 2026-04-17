import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import lottie from "lottie-web"
import { withAuth } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import bananaImg from "../assets/banana.svg"
import bgImage from "../assets/backgroundg.webp"
import confettiBlastAnim from "../assets/Confetti Partyyy!!.json"
import ElectroBorder from "../components/ElectroBorder"

export default function Game() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const location = useLocation()
  const levelNo = location.state?.level || 1
  const isMathMode = levelNo >= 6
  const api = withAuth(token)
  const [puzzle, setPuzzle] = useState(null)
  const [answer, setAnswer] = useState("")
  const [seconds, setSeconds] = useState(30)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState("")
  const [musicEnabled, setMusicEnabled] = useState(localStorage.getItem("musicEnabled") !== "false")
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem("musicVolume") || "0.2"))
  const [showConfetti, setShowConfetti] = useState(false)

  const toggleMusic = () => {
    const newState = !musicEnabled
    setMusicEnabled(newState)
    localStorage.setItem("musicEnabled", newState)
    window.dispatchEvent(new Event("storage"))
  }

  const changeVolume = (e) => {
    const newVolume = parseFloat(e.target.value)
    setMusicVolume(newVolume)
    localStorage.setItem("musicVolume", newVolume)
    window.dispatchEvent(new Event("storage"))
  }

  const [puzzleCount, setPuzzleCount] = useState(1) // 1 to 3
  const [attempts, setAttempts] = useState(3) // 3 attempts per puzzle
  const [isGameOver, setIsGameOver] = useState(false)
  const [stars, setStars] = useState(0) // 0, 1, 2, 2.5, 3
  const [hasGift, setHasGift] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showLevelShift, setShowLevelShift] = useState(false)
  const levelStartedAtRef = useRef(Date.now())
  const confettiHostRef = useRef(null)

  const getTimerTickMs = (level) => {
    if (level <= 5) return 1000
    if (level === 6) return 950
    if (level === 7) return 900
    if (level === 8) return 820
    if (level === 9) return 740
    return 680
  }

  const getRoundSeconds = () => 30

  const currentEmoji = attempts === 3 ? "🍌" : "😊"
  const currentRank = (user?.profile?.rank || "").trim()
  const showRank = Boolean(currentRank && currentRank.toLowerCase() !== "novice")

  useEffect(() => {
    if (token) {
      resetGame()
      loadPuzzle()
    }
  }, [token, levelNo])

  useEffect(() => {
    if (isPaused || isGameOver || !puzzle) return

    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), getTimerTickMs(levelNo))
      return () => clearTimeout(timer)
    }

    if (seconds === 0) {
      handleTimeout()
    }
  }, [seconds, isPaused, isGameOver, puzzle, levelNo])

  useEffect(() => {
    if (levelNo === 6) {
      setShowLevelShift(true)
      const id = setTimeout(() => setShowLevelShift(false), 2200)
      return () => clearTimeout(id)
    }
    setShowLevelShift(false)
  }, [levelNo])

  useEffect(() => {
    if (!status.includes("Not Correct")) return
    const id = setTimeout(() => setStatus(""), 1800)
    return () => clearTimeout(id)
  }, [status])

  useEffect(() => {
    if (!showConfetti || !status.includes("Correct") || !confettiHostRef.current) return

    const anim = lottie.loadAnimation({
      container: confettiHostRef.current,
      renderer: "svg",
      loop: false,
      autoplay: true,
      animationData: confettiBlastAnim,
    })

    return () => {
      anim.destroy()
    }
  }, [showConfetti, status])

  function handleTimeout() {
    const nextAttempts = attempts - 1
    if (nextAttempts > 0) {
      setAttempts(nextAttempts)
      setSeconds(getRoundSeconds())
      setStatus(`Time's up! Attempt ${4 - nextAttempts} of 3`)
      return
    }

    setAttempts(0)
    setIsGameOver(true)
    setStatus("Game Over! Out of time and attempts.")

    let s = 0
    if (score >= 125) s = 3
    else if (score >= 100) s = 2
    else if (score >= 75) s = 1

    if (s > 0) {
      const marks = getLevelMarks(score)
      setTimeout(() => {
        navigate("/result", { state: { score, marks, stars: s, hasGift: score >= 125, level: levelNo, time: getElapsedLevelSeconds() } })
      }, 1500)
    }
  }

  function resetGame() {
    levelStartedAtRef.current = Date.now()
    setPuzzleCount(1)
    setAttempts(3)
    setSeconds(getRoundSeconds())
    setIsGameOver(false)
    setScore(0)
    setStars(0)
    setHasGift(false)
    setStatus("")
    setShowConfetti(false)
  }

  async function loadPuzzle() {
    try {
      setStatus("")
      setAnswer("")

      const r = await api.get("game/puzzle/", { params: { level: levelNo, puzzle: puzzleCount } })
      setPuzzle(r.data)
    } catch (err) {
      setPuzzle(null)
      const errorMsg = err?.response?.data?.error || err?.message
      setStatus(`Failed to load puzzle: ${errorMsg}`)
      console.error("Load puzzle error details:", {
        status: err?.response?.status,
        data: err?.response?.data,
        msg: err?.message
      })
    }
  }

  async function submit() {
    if (!puzzle || isGameOver || isPaused) return

    const expected = puzzle.correct_answer ?? puzzle.solution
    const correct = String(expected) === String(answer)
    setAnswer("") // Automatically clear the input field after clicking submit

    if (correct) {
      setStatus("Correct")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 900)

      let earned = 0
      if (attempts === 3) earned = 50
      else if (attempts === 2) earned = 25
      else if (attempts === 1) earned = 10

      const newScore = score + earned
      setScore(newScore)


      if (puzzleCount < 3) {
        setTimeout(() => {
          setPuzzleCount(prev => prev + 1)
          setAttempts(3) // Reset attempts for next puzzle
          setSeconds(getRoundSeconds())
          loadPuzzle()
        }, 1000)
      } else {
        let s = 0
        let hasGift = false

        if (newScore >= 125) {
          s = 3
          hasGift = true
        } else if (newScore >= 100) {
          s = 2
        } else if (newScore >= 75) {
          s = 1
        }

        setStars(s)
        setHasGift(hasGift)

        if (s > 0 || hasGift) {
          setStatus("Level Complete!")
          const marks = getLevelMarks(newScore)
          setTimeout(() => {
            navigate("/result", { state: { score: newScore, marks, stars: s, hasGift, level: levelNo, time: getElapsedLevelSeconds() } })
          }, 1500)
        } else {
          setStatus("Failed! Try Again")
          setIsGameOver(true)
        }
      }
    } else {
      const nextAttempts = attempts - 1
      setAttempts(nextAttempts)

      if (nextAttempts > 0) {
        setStatus("Not Correct! Try again.")
      } else {
        setStatus("Not Correct! Out of attempts.")
        let s = 0
        let hasGift = false

        if (score >= 125) {
          s = 3
          hasGift = true
        } else if (score >= 100) {
          s = 2
        } else if (score >= 75) {
          s = 1
        }

        if (s > 0 || hasGift) {
          const marks = getLevelMarks(score)
          setTimeout(() => {
            navigate("/result", { state: { score, marks, stars: s, hasGift, level: levelNo, time: getElapsedLevelSeconds() } })
          }, 1500)
        } else {
          setIsGameOver(true)
        }
      }
    }
  }

  function getElapsedLevelSeconds() {
    return Math.max(0, Math.floor((Date.now() - levelStartedAtRef.current) / 1000))
  }

  function getLevelMarks(totalScore) {
    if (totalScore >= 125) return 150
    if (totalScore >= 100) return 110
    if (totalScore >= 75) return 80
    return totalScore
  }

  function formatTime(s) {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {showLevelShift && (
        <div className="absolute inset-0 z-40 bg-[#030b22]/85 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center animate-in zoom-in duration-500">
            <div className="text-cyan-300 text-sm md:text-base font-black uppercase tracking-[0.3em]">{t("game.levelUp", "Level Up")}</div>
            <div className="text-4xl md:text-6xl font-black uppercase text-white mt-2">{t("game.mathTerminal", "Math Terminal")}</div>
            <div className="text-cyan-200/80 text-sm md:text-lg font-bold uppercase tracking-[0.2em] mt-2">{t("game.mechanicsShiftUnlocked", "Mechanics Shift Unlocked")}</div>
          </div>
        </div>
      )}

      {/* Level Number Indicator - Left Side */}
      <div className="absolute left-4 top-24 z-30 flex flex-col gap-2">
        <div className="bg-[#0a2f5e] border-4 border-cyan-500 rounded-2xl p-3 shadow-[0_4px_0_0_#07122d] text-white flex flex-col items-center min-w-[80px]">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-cyan-200/70">{t("game.level", "Level")}</span>
          <span className="text-4xl font-black italic tracking-tighter">{levelNo}</span>
        </div>
        <div className={`border-4 rounded-2xl p-3 shadow-[0_4px_0_0_#07122d] text-white flex flex-col items-center min-w-[80px] ${isMathMode ? 'bg-purple-900 border-purple-400' : 'bg-orange-900 border-orange-400'}`}>
          <span className="text-[10px] font-black uppercase italic tracking-widest text-cyan-200/70">{t("game.score", "Score")}</span>
          <span className={`game-clear-number text-3xl font-black tracking-tighter ${isMathMode ? 'text-purple-200' : 'text-orange-200'}`}>{score}</span>
        </div>
      </div>

      {/* Right Side Control Buttons */}
      <div className="absolute right-4 top-24 z-30 flex flex-col gap-4">
        {/* Play/Resume Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`w-16 h-16 rounded-2xl border-4 border-cyan-600 flex items-center justify-center shadow-[0_4px_0_0_#07122d] transition-all active:translate-y-1 active:shadow-none ${isPaused ? 'bg-cyan-500 text-[#07122d] animate-pulse' : isMathMode ? 'bg-purple-500 text-white' : 'bg-orange-500 text-[#07122d]'}`}
          title={isPaused ? "Resume Game" : "Pause Game"}
        >
          {isPaused ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v6a1 1 0 001.555.832l4-3a1 1 0 000-1.664l-4-3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Replay Button */}
        <button
          onClick={() => { resetGame(); loadPuzzle() }}
          className="w-16 h-16 bg-[#0a2f5e] text-cyan-200 rounded-2xl border-4 border-cyan-600 flex items-center justify-center shadow-[0_4px_0_0_#07122d] transition-all active:translate-y-1 active:shadow-none"
          title="Restart Level"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Top Navbar */}
      <nav className="h-16 bg-[#0a1c3d]/95 border-b border-cyan-500/30 flex items-center px-4 md:px-8 gap-6 z-20">
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={() => navigate("/home")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${isMathMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
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
            <span className="text-lg font-black">{user?.profile?.diamonds || 0}</span>
          </div>

          {/* Gifts */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isMathMode ? 'bg-purple-950/40 border border-purple-400/40 text-purple-300' : 'bg-orange-950/40 border border-orange-400/40 text-orange-300'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-lg ${isMathMode ? 'bg-purple-500' : 'bg-orange-500'}`}>
              <span className="text-sm">🎁</span>
            </div>
            <span className="text-lg font-black">{user?.profile?.gifts || 0}</span>
          </div>

          <div className="relative rounded-md border border-cyan-300/50 bg-[#071428]/85 p-0.5 shadow-lg backdrop-blur-sm">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-7 w-[62px] appearance-none rounded border border-cyan-400/40 bg-[#0b1c35] py-0 pl-1.5 pr-5 text-[10px] font-black uppercase tracking-wide text-cyan-100 outline-none transition-colors hover:border-cyan-300/70 focus:border-cyan-300"
              aria-label="Select language"
            >
              <option value="en">EN</option>
              <option value="ta">TA</option>
              <option value="si">සි</option>
            </select>
            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-cyan-300">▼</span>
          </div>

          {/* User Profile */}
          <div
            onClick={() => navigate("/account")}
            className="flex items-center gap-3 pl-4 border-l border-cyan-400/30 cursor-pointer group hover:bg-cyan-900/20 transition-colors"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-cyan-500/40 group-hover:border-cyan-300 transition-colors ${isMathMode ? 'bg-purple-500' : 'bg-orange-500'}`}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-black uppercase tracking-tight group-hover:text-cyan-300 transition-colors">{user?.username || "Guest"}</span>
              {showRank && (
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isMathMode ? 'text-purple-300' : 'text-orange-300'}`}>{currentRank}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <ElectroBorder
          className="w-full max-w-5xl"
          borderColor="#00f6ff"
          borderWidth={2}
          distortion={1}
          animationSpeed={0.9}
          radius="0.9rem"
          glow
          aura
          effects
          glowBlur={22}
        >
          <div className="game-inner-bg rounded-xl overflow-hidden shadow-2xl p-5 md:p-8 min-h-[560px] flex flex-col">
            <h1 className="game-champ-title text-center mb-4">{t("game.brainAdventure", "Brain Adventure")}</h1>

            {/* Header section matching the image */}
            <div className="mb-4">
              <div className="flex justify-center items-start">
                <div className="game-timer-pill text-white text-4xl md:text-6xl px-8 py-1.5 rounded-3xl min-w-[170px] text-center">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            {/* Puzzle Progress and Attempts */}
            <div className="flex justify-between items-center mb-4 text-sm md:text-3xl">
              <div className="game-outline-text">{t("game.puzzle", "Puzzle")} {puzzleCount} / 3</div>
              <div className="flex gap-2 items-center">
                <span className="game-outline-text">{t("game.attempts", "Attempts")}:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border border-red-950/40 ${i <= attempts ? "bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.9)]" : "bg-slate-300/70"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* The Grid area */}
            <div className="flex-1 flex items-center justify-center my-4 relative">
              {isGameOver && (
                <div className="absolute inset-0 game-over-neon z-20 flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
                  <div className="flex items-center gap-4 md:gap-8 mb-4">
                    <span className="game-over-neon-symbol">◁</span>
                    <div className="game-over-neon-title text-center">
                      <div className="game-over-neon-green text-5xl md:text-7xl">{t("game.gameOver", "Game Over")}</div>
                    </div>
                    <span className="game-over-neon-symbol">▷</span>
                  </div>

                  <div className="game-over-neon-symbol mb-6">+ × □ ○</div>

                  <button
                    onClick={() => { resetGame(); loadPuzzle() }}
                    className="game-cta-btn px-8 py-2 rounded-2xl text-2xl"
                  >
                    {t("game.playAgain", "Play Again")}
                  </button>
                </div>
              )}

              {isPaused && (
                <div className="absolute inset-0 bg-[#07122d]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                  <div className="text-cyan-200 text-4xl font-black italic uppercase tracking-tighter mb-4">{t("game.gamePaused", "Game Paused")}</div>
                  <button
                    onClick={() => setIsPaused(false)}
                    className={`px-8 py-3 rounded-full font-black italic uppercase shadow-lg hover:scale-110 transition-transform ${isMathMode ? 'bg-purple-500 text-white' : 'bg-orange-500 text-[#07122d]'}`}
                  >
                    {t("game.resume", "Resume")} 🎮
                  </button>
                </div>
              )}
              {!puzzle && status.includes("Failed") && (
                <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border-2 border-red-100">
                  <span className="text-red-500 font-bold mb-4">{status}</span>
                  <button
                    onClick={loadPuzzle}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${isMathMode ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-orange-500 text-[#07122d] hover:bg-orange-600'}`}
                  >
                    Retry Loading Puzzle
                  </button>
                </div>
              )}
              {puzzle?.type === "external" && (
                <div className="electro-border puzzle-stage w-full max-w-4xl p-3 shadow-sm flex items-center justify-center min-h-[390px]">
                  <img
                    src={puzzle.question}
                    alt="Banana Puzzle"
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      console.error("Image load failed", e);
                      setStatus("Failed to load puzzle image");
                    }}
                  />
                </div>
              )}

              {isMathMode && puzzle && (
                <div className="math-terminal-shell w-full max-w-4xl min-h-[390px] p-5 md:p-8 rounded-2xl flex flex-col items-center justify-center">
                  <div className="math-terminal-badge mb-4">{t("game.mathTerminal", "Math Terminal")}</div>
                  <div className="math-terminal-question text-center mb-4">
                    {puzzle.question_text || puzzle.question}
                  </div>
                  <div className="text-cyan-200/70 text-xs md:text-sm font-bold uppercase tracking-[0.18em] mb-4">
                    Difficulty x{puzzle.difficulty_multiplier ?? 1}
                  </div>

                  <div className="math-terminal-answer mb-4">{answer || "_"}</div>

                  <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[260px] w-full">
                    {["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "←"].map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (isPaused || isGameOver) return
                          if (key === "C") {
                            setAnswer("")
                            return
                          }
                          if (key === "←") {
                            setAnswer((prev) => prev.slice(0, -1))
                            return
                          }
                          setAnswer((prev) => `${prev}${key}`)
                        }}
                        disabled={isPaused || isGameOver}
                        className="math-key-btn"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={submit}
                    disabled={isPaused || isGameOver}
                    className="math-submit-btn mt-4"
                  >
                    {t("game.submit", "Submit")}
                  </button>
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
                <div className="relative min-h-[58px]">
                  {showConfetti && status.includes("Correct") && (
                    <div className="confetti-blast">
                      <span className="blast-core" />
                      <div className="lottie-bomb-wrap">
                        <div ref={confettiHostRef} className="w-full h-full" />
                      </div>
                    </div>
                  )}

                  <div className={`mb-2 text-2xl font-black italic ${status.includes("Not Correct") ? "wrong-answer-fx" : ""} ${status.includes("Correct") ? "correct-answer-fx" : ""} ${status.includes("Correct") || status === "Level Complete!" ? "text-green-400" : "text-red-400"}`}>
                    {status.includes("Not Correct") ? "Wrong Answer 🙈" : status}
                  </div>
                </div>
              )}

              {!isMathMode && (
                <>
                  <div className="game-outline-text text-3xl mb-3">{t("game.questReady", "Quest is ready.")}</div>

                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="game-outline-text text-2xl flex items-center gap-2">
                      {t("game.enterMissingDigit", "Enter the missing digit:")}
                      <div className="game-input-shell rounded-2xl p-1.5">
                        <input
                          inputMode="numeric"
                          value={answer}
                          onChange={e => setAnswer(e.target.value.replace(/\D/g, ""))}
                          disabled={isPaused || isGameOver}
                          className="w-20 h-11 text-3xl text-center rounded-xl bg-transparent text-white font-black font-mono tracking-[0.08em] border-none shadow-sm outline-none disabled:opacity-50"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 ml-auto items-center">
                      <button onClick={submit} disabled={isPaused || isGameOver} className="game-cta-btn px-8 py-1.5 disabled:opacity-50 rounded-2xl text-4xl">{t("game.submit", "Submit")}</button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (puzzleCount > 1) {
                              setPuzzleCount(p => p - 1)
                              setAttempts(3)
                              setSeconds(getRoundSeconds())
                              loadPuzzle()
                            }
                          }}
                          disabled={puzzleCount <= 1 || isPaused || isGameOver}
                          className="game-cta-btn px-3 py-1.5 disabled:opacity-50 rounded-xl text-2xl transition-colors leading-none"
                          title={t("game.previousPuzzle", "Previous Puzzle")}
                        >
                          ←
                        </button>
                        <button
                          onClick={() => {
                            if (puzzleCount < 3) {
                              setPuzzleCount(p => p + 1)
                              setAttempts(3)
                              setSeconds(getRoundSeconds())
                              loadPuzzle()
                            }
                          }}
                          disabled={puzzleCount >= 3 || isPaused || isGameOver}
                          className="game-cta-btn px-3 py-1.5 disabled:opacity-50 rounded-xl text-2xl transition-colors leading-none"
                          title={t("game.nextPuzzle", "Next Puzzle")}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isMathMode && (
                <div className="mt-2 text-center text-cyan-100/80 text-xs md:text-sm font-bold uppercase tracking-[0.16em]">
                  {t("game.mathModeEngaged", "Math mode engaged • Timer accelerates with level")}
                </div>
              )}

              <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-cyan-100/70 uppercase tracking-wider">
                <span className="game-outline-text text-lg">{t("game.totalScore", "Total Score:")} <span className={`game-clear-number text-2xl font-black ${isMathMode ? 'text-purple-300' : 'text-orange-300'}`}>{score}</span></span>
                {isGameOver && (
                  <button
                    onClick={resetGame}
                    className="game-outline-text text-lg hover:underline"
                  >
                    {t("game.playAgain", "Play Again")}
                  </button>
                )}
              </div>
            </div>

          </div>
        </ElectroBorder>
      </div>
    </div>
  )
}
