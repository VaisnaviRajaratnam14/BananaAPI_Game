import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

export default function BackgroundMusic() {
  const location = useLocation()
  const [isPlaying, setIsPlaying] = useState(localStorage.getItem("musicEnabled") !== "false")
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem("musicVolume") || "0.2"))
  const [loadError, setLoadError] = useState(false)
  const audioRef = useRef(null)
  
  const hiddenPages = ["/login", "/forgot", "/reset-password", "/register", "/otp", "/intro"]
  const isHidden = hiddenPages.includes(location.pathname)

  useEffect(() => {
    const handleStorageChange = () => {
      setIsPlaying(localStorage.getItem("musicEnabled") !== "false")
      setVolume(parseFloat(localStorage.getItem("musicVolume") || "0.2"))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
      audio.loop = true
      audio.volume = volume
      
      const handleAudioError = (e) => {
        console.warn("Primary music link failed, trying local fallback...")
        if (!audio.src.includes("background-music.mp3")) {
          audio.src = "/src/assets/music/background-music.mp3"
          audio.load()
        } else {
          setLoadError(true)
        }
      }
      
      audio.addEventListener('error', handleAudioError)
      audioRef.current = audio
    }

    const audio = audioRef.current
    audio.volume = volume

    if (isPlaying && !isHidden && !loadError) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false)
          localStorage.setItem("musicEnabled", "false")
        })
      }
    } else {
      audio.pause()
    }

    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [isPlaying, isHidden, location.pathname, loadError])

  const [showVolume, setShowVolume] = useState(false)

  const handleToggleVolumeUI = (e) => {
    e.stopPropagation()
    setShowVolume(!showVolume)
  }

  const toggleMusic = () => {
    const newState = !isPlaying
    setIsPlaying(newState)
    localStorage.setItem("musicEnabled", newState)
    if (newState && audioRef.current) {
      audioRef.current.play().then(() => {
      }).catch(() => {
        setIsPlaying(false)
        localStorage.setItem("musicEnabled", "false")
      })
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    localStorage.setItem("musicVolume", newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  if (isHidden || loadError) return null

  return (
    <>
      <div 
        className="fixed bottom-6 left-6 z-50 flex items-center gap-3"
        onMouseLeave={() => setShowVolume(false)}
      >
        <div className="relative">
          <button
            onClick={toggleMusic}
            className="w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
            title={isPlaying ? "Mute Music" : "Play Music"}
          >
            <span className="text-2xl">{isPlaying ? "🔊" : "🔈"}</span>
            
            {/* Decorative pulse when playing */}
            {isPlaying && (
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping -z-10"></span>
            )}
          </button>

          {/* Volume Settings Toggle (The small gear/plus icon) */}
          <button 
            onClick={handleToggleVolumeUI}
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-[#5d3a1a] rounded-full flex items-center justify-center text-[10px] font-black shadow-md border border-white/50 hover:scale-110 transition-transform"
          >
            {showVolume ? "✕" : "⚙️"}
          </button>
        </div>

        {/* Volume Slider Popover */}
        <div className={`
          bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-2xl shadow-xl transition-all duration-300 origin-left
          ${showVolume ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-0 -translate-x-4 pointer-events-none"}
        `}>
          <div className="flex items-center gap-3 min-w-[120px]">
            <span className="text-xs">🔈</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
            <span className="text-xs">🔊</span>
          </div>
        </div>
      </div>
    </>
  )
}
