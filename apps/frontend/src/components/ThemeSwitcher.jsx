import React, { useEffect, useState } from "react"

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light")
  useEffect(() => {
    localStorage.setItem("theme", theme)
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [theme])
  return (
    <button onClick={() => setTheme(theme==="dark"?"light":"dark")} className="px-3 py-1 rounded bg-white/60">
      {theme==="dark"?"Light":"Dark"}
    </button>
  )
}
