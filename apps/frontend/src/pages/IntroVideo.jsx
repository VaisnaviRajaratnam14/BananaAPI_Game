import React, { useRef } from "react"
import { useNavigate } from "react-router-dom"


export default function IntroVideo() {
  const navigate = useNavigate()
  const videoRef = useRef(null)

  const handlePlayNow = () => {
    navigate("/home")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover absolute inset-0"
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <button
        type="button"
        onClick={handlePlayNow}
        className="absolute bottom-8 right-8 z-20 bg-orange-500 hover:bg-orange-400 text-white font-black italic uppercase tracking-widest px-7 py-3 rounded-full border-2 border-orange-200/60 shadow-[0_0_24px_rgba(251,146,60,0.6)] transition-all duration-300 hover:scale-105 animate-bounce"
      >
        Play Now
      </button>
    </div>
  )
}
