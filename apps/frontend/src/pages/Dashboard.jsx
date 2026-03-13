import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import heroVideo from "../assets/videob.mp4"
import quizBtn from "../assets/Quiz button.webm"

export default function Dashboard() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    v.addEventListener("loadeddata", tryPlay)
    return () => v.removeEventListener("loadeddata", tryPlay)
  }, [])

  return (
    <div className="relative min-h-screen">
      <video
        ref={videoRef}
        src={heroVideo}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted={muted}
        preload="auto"
        playsInline
      />
      <button
        onClick={() => {
          const next = !muted
          setMuted(next)
          if (videoRef.current) {
            videoRef.current.muted = next
            videoRef.current.play().catch(()=>{})
          }
        }}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        title={muted ? "Sound Off" : "Sound On"}
        className="absolute top-6 right-6 z-10 px-3 py-2 btn-orange"
      >
        <span className="text-xl">{muted ? "🔇" : "🔊"}</span>
      </button>
      <button
        onClick={() => navigate("/home")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-label="Start Quiz"
        title="Start Quiz"
      >
        <video
          src={quizBtn}
          autoPlay
          loop
          muted
          playsInline
          className="w-40 md:w-56 drop-shadow-xl"
        />
      </button>
    </div>
  )
}
