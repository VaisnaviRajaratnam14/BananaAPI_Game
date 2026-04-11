import React from "react"
import { useLocation } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const location = useLocation()
  const isGamePage = location.pathname === "/game"
  const positionClass = "right-20 top-[72px] md:right-6"

  if (isGamePage) return null

  return (
    <div className={`fixed ${positionClass} z-50 rounded-md border border-cyan-300/50 bg-[#071428]/85 p-0.5 text-xs font-black uppercase tracking-wider text-cyan-100 shadow-lg backdrop-blur-sm`}>
      <div className="relative">
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
    </div>
  )
}
