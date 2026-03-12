import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

export default function BackgroundMusic() {
  const location = useLocation()
  const audioRef = useRef(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"))
  const [isPlaying, setIsPlaying] = useState(localStorage.getItem("musicEnabled") !== "false")
  
  // Hide music on landing, login, register, otp pages
  const hiddenPages = ["/", "/login", "/register", "/otp", "/intro"]
  const isHidden = hiddenPages.includes(location.pathname)

  useEffect(() => {
    const audio = audioRef.current
    audio.loop = true
    audio.volume = 0.2

    if (isPlaying && !isHidden) {
      audio.play().catch(err => {
        console.log("Autoplay blocked or audio error:", err)
        // Usually requires a user interaction first
      })
    } else {
      audio.pause()
    }

    return () => audio.pause()
  }, [isPlaying, isHidden, location.pathname])

  const toggleMusic = () => {
    const newState = !isPlaying
    setIsPlaying(newState)
    localStorage.setItem("musicEnabled", newState)
  }

  if (isHidden) return null

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
      title={isPlaying ? "Mute Music" : "Play Music"}
    >
      <span className="text-2xl">{isPlaying ? "🔊" : "🔈"}</span>
      
      {/* Decorative pulse when playing */}
      {isPlaying && (
        <span className="absolute inset-0 rounded-full bg-white/20 animate-ping -z-10"></span>
      )}
    </button>
  )
}
