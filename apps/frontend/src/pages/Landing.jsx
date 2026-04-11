import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import welcomeBg from "../assets/welcome.jpg"

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(12,34,86,0.35),rgba(5,10,35,0.72))]" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="landing-aurora-text text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] mb-5">
          {t("landing.welcomeTo", "Welcome to")}
          <span className="block">{t("landing.brainAdventure", "Brain Adventure")}</span>
        </h1>

        <p className="landing-enter-text text-lg md:text-2xl font-bold text-cyan-100/90 mb-10 uppercase tracking-[0.15em]">
          {t("landing.comeJoin", "Come join the adventure")}
        </p>

        <button
          onClick={() => navigate("/login")}
          className="px-10 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black italic uppercase tracking-wider border-2 border-orange-200/60 shadow-[0_8px_0_#c2410c] hover:shadow-[0_5px_0_#c2410c] transition-all active:translate-y-1 active:shadow-[0_3px_0_#c2410c]"
        >
          {t("landing.start", "Start")}
        </button>
      </div>
    </div>
  )
}
