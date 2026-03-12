import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, setUser } = useAuth()
  const api = withAuth(token)
  
  const { score = 0, stars = 0, hasGift = false, level = 1 } = location.state || {}
  const [collected, setCollected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [giftOpened, setGiftOpened] = useState(false)
  const [showRewardPop, setShowRewardPop] = useState(false)

  async function handleCollect() {
    if (collected || loading) return
    
    if (hasGift && !giftOpened) {
      setGiftOpened(true)
      setShowRewardPop(true)
      return
    }

    setLoading(true)
    try {
      const diamondsEarned = Math.floor(stars * 10) + (hasGift ? 50 : 0)
      const giftsEarned = hasGift ? 1 : 0
      
      const r = await api.post("/auth/collect", { 
        diamonds: diamondsEarned, 
        gifts: giftsEarned,
        level,
        stars,
        score
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Banana Puzzle Game',
        text: `I just scored ${score} on Level ${level}! Can you beat me?`,
        url: window.location.origin,
      }).catch(console.error);
    } else {
      alert("Sharing is not supported on this browser.")
    }
  }

  return (
    <div className="min-h-screen bg-[#fceec7] flex flex-col items-center justify-center p-4 font-mono overflow-hidden relative">
      {/* Background Stripes like the image */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8b5a2b, #8b5a2b 2px, transparent 2px, transparent 40px)' }}></div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Main Scoreboard Container */}
        <div className="relative w-full">
          {/* Level Complete Ribbon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 w-full px-4">
            <div className="relative bg-[#c2a000] border-4 border-[#5d3a1a] rounded-lg py-2 shadow-xl transform -rotate-1">
               <div className="text-white text-3xl font-black italic uppercase tracking-widest text-center drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                 LEVEL COMPLETE
               </div>
               {/* Ribbon Tails */}
               <div className="absolute -left-2 top-2 w-6 h-10 bg-[#8b7200] -z-10 skew-y-[15deg] border-2 border-[#5d3a1a]"></div>
               <div className="absolute -right-2 top-2 w-6 h-10 bg-[#8b7200] -z-10 skew-y-[-15deg] border-2 border-[#8b5a2b]"></div>
            </div>
          </div>

          {/* The Brown Card */}
          <div className="bg-[#5d3a1a] pt-20 pb-12 px-8 rounded-[4rem] border-[12px] border-[#c2a000] shadow-[0_15px_0_0_rgba(0,0,0,0.3)] text-center relative overflow-hidden">
            
            {/* Stars & Level Section */}
            <div className="relative h-48 flex items-center justify-center mb-8">
              {/* Side Stars */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-7xl text-[#c2a000] opacity-90 drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]">
                {stars >= 1 ? "★" : "☆"}
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl text-[#c2a000] opacity-90 drop-shadow-[0_4px_0_rgba(0,0,0,0.4)]">
                {stars >= 3 ? "★" : "☆"}
              </div>

              {/* Central Large Star */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="text-[12rem] text-[#c2a000] drop-shadow-[0_8px_0_rgba(0,0,0,0.4)] leading-none">
                  {stars >= 2 ? "★" : "☆"}
                </div>
                {/* Level Text Over Central Star */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-white text-2xl font-black italic uppercase tracking-tighter opacity-80">LEVEL</span>
                  <span className="text-white text-6xl font-black italic tracking-tighter mt-[-10px]">{level}</span>
                </div>
              </div>
            </div>

            {/* Score Label */}
            <div className="text-white text-xl font-black uppercase italic mb-3 tracking-[0.2em]">SCORE</div>

            {/* Pill-Shaped Score Box */}
            <div className="bg-white rounded-full py-6 px-12 border-4 border-[#8b5a2b] shadow-[inset_0_6px_0_0_rgba(0,0,0,0.1)] mb-12">
              <span className="text-[#5d3a1a] text-7xl font-black italic tracking-tighter">
                {score}
              </span>
            </div>

            {/* Reward Pop Animation */}
            {giftOpened && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#5d3a1a]/90 animate-in fade-in duration-300">
                <div className="flex flex-col items-center">
                  <div className="text-9xl animate-bounce mb-4">💎</div>
                  <span className="text-4xl text-white font-black italic uppercase animate-pulse">
                    +50 DIAMONDS!
                  </span>
                  <button 
                    onClick={() => setGiftOpened(false)}
                    className="mt-8 bg-[#c2a000] text-white px-8 py-2 rounded-full font-black italic uppercase"
                  >
                    AWESOME!
                  </button>
                </div>
              </div>
            )}

            {/* Gift Box Interaction */}
            {hasGift && !giftOpened && (
              <div 
                onClick={() => handleCollect()}
                className="absolute bottom-40 right-10 text-7xl cursor-pointer animate-bounce hover:scale-110 transition-transform z-20"
              >
                🎁
              </div>
            )}

            {/* Bottom Circular Buttons */}
            <div className="flex justify-center gap-6">
              {/* Restart Button */}
              <button 
                onClick={handleRestart}
                className="w-20 h-20 bg-[#c2a000] rounded-full border-b-8 border-[#8b7200] flex items-center justify-center shadow-lg hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all"
              >
                <svg className="w-10 h-10 text-[#5d3a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Next/Collect Button */}
              <button 
                onClick={handleCollect} 
                disabled={loading || collected}
                className="w-20 h-20 bg-[#c2a000] rounded-full border-b-8 border-[#8b7200] flex items-center justify-center shadow-lg hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
              >
                <svg className="w-10 h-10 text-[#5d3a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Share Button */}
              <button 
                onClick={handleShare}
                className="w-20 h-20 bg-[#c2a000] rounded-full border-b-8 border-[#8b7200] flex items-center justify-center shadow-lg hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all"
              >
                <svg className="w-10 h-10 text-[#5d3a1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 100.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Bar at the very bottom */}
        <div className="mt-10 w-full bg-[#5d3a1a] h-10 rounded-full border-4 border-[#c2a000] relative overflow-hidden shadow-lg">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#c2a000] to-[#8b7200] transition-all duration-1000"
            style={{ width: collected ? '100%' : '40%', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 30px)' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white italic uppercase tracking-[0.3em]">
            {collected ? 'SUCCESS!' : 'LOADING...'}
          </div>
        </div>

      </div>

      {/* Success Particles */}
      {collected && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-bounce text-5xl" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()}s`, opacity: 0.6 }}>✨</div>
          ))}
        </div>
      )}
    </div>
  )
}
