import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { withAuth } from "../utils/api"

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { token, setUser } = useAuth()
  const api = withAuth(token)
  
  const { score = 0, marks, stars = 0, hasGift = false, level = 1, time = 0 } = location.state || {}
  const totalMarks = marks ?? (score >= 125 ? 150 : score >= 100 ? 110 : score >= 75 ? 80 : score)
  const [collected, setCollected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [giftOpened, setGiftOpened] = useState(false)
  const [showRewardPop, setShowRewardPop] = useState(false)

  function formatTime(s) {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  async function handleCollect() {
    if (collected || loading) return
    
    if (hasGift && !giftOpened) {
      setGiftOpened(true)
      return
    }

    setLoading(true)
    try {
      const diamondsEarned = Math.floor(stars * 10) + (hasGift ? 50 : 0)
      const giftsEarned = hasGift ? 1 : 0
      
      const r = await api.post("game/collect/", { 
        diamonds: diamondsEarned, 
        gifts: giftsEarned,
        level,
        stars,
        score,
        time
      })
      
      setUser(r.data)
      setCollected(true)
      
      setTimeout(() => {
        navigate("/home")
      }, 1500)
    } catch (err) {
      console.error("Collection error", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    navigate("/game", { state: { level } })
  }

  const handleNextLevel = async () => {
    await handleCollectSilently()
    navigate("/game", { state: { level: level + 1 } })
  }

  const handleGoHome = async () => {
    await handleCollectSilently()
    navigate("/home")
  }

  async function handleCollectSilently() {
    if (collected || loading) return
    
    setLoading(true)
    try {
      const diamondsEarned = Math.floor(stars * 10) + (hasGift ? 50 : 0)
      const giftsEarned = hasGift ? 1 : 0
      
      const r = await api.post("game/collect/", { 
        diamonds: diamondsEarned, 
        gifts: giftsEarned,
        level,
        stars,
        score,
        time
      })
      
      setUser(r.data)
      setCollected(true)
    } catch (err) {
      console.error("Collection error", err)
    } finally {
      setLoading(false)
    }
  }

  const [musicEnabled, setMusicEnabled] = useState(localStorage.getItem("musicEnabled") !== "false")
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem("soundEnabled") !== "false")
  const [musicVolume, setMusicVolume] = useState(parseFloat(localStorage.getItem("musicVolume") || "0.2"))

  const toggleMusic = () => {
    const newState = !musicEnabled
    setMusicEnabled(newState)
    localStorage.setItem("musicEnabled", newState)
    window.dispatchEvent(new Event("storage"))
  }

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    localStorage.setItem("soundEnabled", newState)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setMusicVolume(newVolume)
    localStorage.setItem("musicVolume", newVolume)
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07122d] via-[#0a2f5e] to-[#041229] flex flex-col items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Jungle Leaves Background (using emojis for a quick leafy feel) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute text-8xl md:text-9xl animate-pulse"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {['🌿', '🍃', '🌱', '🎋'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      <div className="z-10 w-full max-w-sm flex flex-col items-center animate-in zoom-in duration-500">
        
        {/* Ropes hanging from top */}
        <div className="absolute top-0 left-1/4 w-1 h-32 bg-cyan-400/70 shadow-lg border-x border-cyan-200/40"></div>
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-cyan-400/70 shadow-lg border-x border-cyan-200/40"></div>

        {/* Main Wooden Board */}
        <div className="relative w-full mt-20">
          
          {/* Stars at the top */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-end gap-1 z-30">
            <div className={`text-5xl drop-shadow-lg ${stars >= 1 ? 'text-orange-400' : 'text-slate-500'} transform -rotate-12`}>★</div>
            <div className={`text-7xl drop-shadow-lg ${stars >= 2 ? 'text-orange-400' : 'text-slate-500'} mb-2`}>★</div>
            <div className={`text-5xl drop-shadow-lg ${stars >= 3 ? 'text-orange-400' : 'text-slate-500'} transform rotate-12`}>★</div>
          </div>

          {/* Wooden Card Body */}
          <div className="bg-[#0a1c3d] p-2 rounded-[3rem] border-8 border-cyan-500 shadow-[0_15px_0_0_#041229] text-center">
            <div className="bg-[#10376c] rounded-[2.5rem] p-6 border-4 border-cyan-400/70 shadow-inner">
              
              <h1 className="text-5xl font-black text-orange-400 italic uppercase tracking-tighter mb-1 drop-shadow-[0_4px_0_#041229]">
                {t("result.youWon", "You Won")}
              </h1>
              <div className="text-cyan-100 text-xl font-bold uppercase tracking-widest mb-6 drop-shadow-md">
                {t("result.level", "Level")} {level}
              </div>

              {/* Reward Section */}
              <div className="bg-white/95 rounded-3xl p-6 border-4 border-cyan-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.15)] mb-8">
                <h2 className="text-[#0a2f5e] text-2xl font-black italic mb-4">{t("result.yourReward", "Your Reward")}</h2>
                <div className="flex justify-center gap-8 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🪙</span>
                    <span className="text-orange-500 text-2xl font-black italic">{totalMarks}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">💎</span>
                    <span className="text-cyan-600 text-2xl font-black italic">{Math.floor(stars * 10)}</span>
                  </div>
                </div>
                <div className="text-center text-sm font-bold text-[#0a2f5e] mb-4">
                  {t("result.marksRawScore", "Marks")}: {totalMarks} | {t("result.rawScore", "Raw Score")}: {score}
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#eef7ff] rounded-xl py-2 px-4 w-fit mx-auto border border-cyan-200">
                  <span className="text-xl">⏱️</span>
                  <span className="text-[#0a2f5e] text-xl font-black font-mono">{formatTime(time)}</span>
                </div>
              </div>

              {/* Main Buttons */}
              <div className="flex flex-col gap-4 mb-2">
                {hasGift && !giftOpened ? (
                  <button 
                    onClick={handleCollect}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black italic py-4 rounded-3xl border-b-8 border-orange-700 shadow-xl transition-all active:translate-y-1 active:border-b-0 text-3xl uppercase tracking-wider animate-bounce"
                  >
                    {t("result.openGift", "Open Gift")} 🎁
                  </button>
                ) : (
                  <button 
                    onClick={handleNextLevel}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#07122d] font-black italic py-4 rounded-3xl border-b-8 border-cyan-700 shadow-xl transition-all active:translate-y-1 active:border-b-0 text-3xl uppercase tracking-wider"
                  >
                    {t("result.next", "Next")}
                  </button>
                )}
                <button 
                  onClick={handleGoHome}
                  className="w-full bg-[#0a2f5e] hover:bg-[#0f4182] text-white font-black italic py-4 rounded-3xl border-b-8 border-cyan-700 shadow-xl transition-all active:translate-y-1 active:border-b-0 text-3xl uppercase tracking-wider"
                >
                  {t("result.home", "Home")}
                </button>
              </div>

              {/* Gift Opening Popover */}
              {giftOpened && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white p-8 rounded-[3rem] border-8 border-orange-400 shadow-2xl flex flex-col items-center animate-in zoom-in duration-500">
                    <div className="text-9xl mb-4 animate-bounce">💎</div>
                    <h2 className="text-4xl font-black text-[#0a2f5e] italic uppercase mb-2">{t("result.jackpot", "Jackpot!")}</h2>
                    <p className="text-xl font-bold text-slate-600 mb-6">+50 {t("result.diamondsFound", "DIAMONDS FOUND")}</p>
                    <button 
                      onClick={handleCollect}
                      className="bg-cyan-500 text-[#07122d] px-10 py-3 rounded-full font-black italic uppercase shadow-lg hover:scale-110 transition-transform"
                    >
                      {t("result.collectAll", "Collect All")} 💰
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Small Board */}
        <div className="mt-8 relative w-full max-w-[280px]">
          {/* Small Ropes */}
          <div className="absolute -top-8 left-10 w-0.5 h-10 bg-cyan-400/70 border-x border-cyan-200/40"></div>
          <div className="absolute -top-8 right-10 w-0.5 h-10 bg-cyan-400/70 border-x border-cyan-200/40"></div>

          <div className="bg-[#0a1c3d] p-1.5 rounded-3xl border-4 border-cyan-500 shadow-[0_8px_0_0_#041229]">
            <div className="bg-[#10376c] rounded-2xl p-3 border-2 border-cyan-400/70 flex flex-col gap-3">
              <div className="flex justify-between items-center gap-2">
                <button 
                  onClick={toggleSound}
                  className={`flex-1 aspect-square rounded-full flex flex-col items-center justify-center border-2 border-cyan-800 shadow-md transition-all active:scale-95 ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-500'}`}
                >
                  <span className="text-xl">🔊</span>
                  <span className="text-[8px] font-black uppercase text-white">{t("result.sound", "Sound")}</span>
                </button>
                <button 
                  onClick={toggleMusic}
                  className={`flex-1 aspect-square rounded-full flex flex-col items-center justify-center border-2 border-cyan-800 shadow-md transition-all active:scale-95 ${musicEnabled ? 'bg-cyan-500' : 'bg-slate-500'}`}
                >
                  <span className="text-xl">🎵</span>
                  <span className="text-[8px] font-black uppercase text-white">{t("result.music", "Music")}</span>
                </button>
                <button 
                  onClick={() => alert(t("result.helpMessage", "Solve Banana Puzzles to earn Diamonds! Complete all 3 puzzles in a level to unlock the next one."))}
                  className="flex-1 aspect-square bg-[#0a2f5e] rounded-full flex flex-col items-center justify-center border-2 border-cyan-800 shadow-md transition-all active:scale-95"
                >
                  <span className="text-xl text-white">❓</span>
                  <span className="text-[8px] font-black uppercase text-white">{t("result.help", "Help")}</span>
                </button>
                <button 
                  onClick={handleRestart}
                  className="flex-1 aspect-square bg-orange-500 rounded-full flex flex-col items-center justify-center border-2 border-orange-700 shadow-md transition-all active:scale-95"
                >
                  <span className="text-xl text-white font-bold">↻</span>
                  <span className="text-[8px] font-black uppercase text-white">{t("result.replay", "Replay")}</span>
                </button>
              </div>

              {/* Volume Slider in Result Board */}
              <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full">
                <span className="text-xs">🔈</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={musicVolume} 
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
                <span className="text-xs">🔊</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Celebration Effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute animate-bounce text-4xl" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 2}s`, 
              opacity: 0.4 
            }}
          >
            ⭐
          </div>
        ))}
      </div>
    </div>
  )
}

