import React, { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function IntroVideo() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [error, setError] = useState(false)

  const handleVideoEnd = () => {
    navigate("/home")
  }

  const skipVideo = () => {
    navigate("/home")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      <video
        ref={videoRef}
        autoPlay
        onEnded={handleVideoEnd}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-gaming-intro-with-a-retro-style-34545-large.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
          <h2 className="text-2xl font-black italic uppercase mb-4">Video failed to load</h2>
          <button 
            onClick={skipVideo}
            className="bg-[#ffa500] text-[#5d2e0a] px-8 py-3 rounded-full font-black italic uppercase shadow-xl hover:scale-110 transition-transform"
          >
            Go to Game Map →
          </button>
        </div>
      )}

      <button
        onClick={skipVideo}
        className="absolute bottom-10 right-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/30 font-black italic uppercase tracking-widest transition-all z-20"
      >
        Skip Intro →
      </button>
    </div>
  )
}
