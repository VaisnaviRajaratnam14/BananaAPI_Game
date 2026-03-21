import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import introVideo from "../assets/b_ad.mp4"


export default function IntroVideo() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    v.addEventListener("loadeddata", tryPlay)
    return () => v.removeEventListener("loadeddata", tryPlay)
  }, [muted])

  const handlePlayNow = () => {
    navigate("/home")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        preload="auto"
        playsInline
        className="w-full h-full object-contain absolute inset-0"
      >
        <source src={introVideo} type="video/mp4" />
        {t("intro.browserNoVideo", "Your browser does not support the video tag.")}
      </video>

      <button
        type="button"
        onClick={() => {
          const nextMuted = !muted
          setMuted(nextMuted)
          if (videoRef.current) {
            videoRef.current.muted = nextMuted
            videoRef.current.play().catch(() => {})
          }
        }}
        aria-label={muted ? t("intro.soundOn", "Turn sound on") : t("intro.soundOff", "Turn sound off")}
        title={muted ? t("intro.soundOn", "Turn sound on") : t("intro.soundOff", "Turn sound off")}
        className="absolute top-6 right-6 z-20 px-3 py-2 btn-orange"
      >
        <span className="text-xl">{muted ? "🔇" : "🔊"}</span>
      </button>

      <button
        type="button"
        onClick={handlePlayNow}
        className="absolute bottom-8 right-8 z-20 bg-orange-500 hover:bg-orange-400 text-white font-black italic uppercase tracking-widest text-xl px-10 py-4 rounded-full border-2 border-orange-200/60 shadow-[0_0_24px_rgba(251,146,60,0.6)] transition-all duration-300 hover:scale-105 animate-bounce"
      >
        {t("intro.playNow", "Play Now")}
      </button>
    </div>
  )
}
