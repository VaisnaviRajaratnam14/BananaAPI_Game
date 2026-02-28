import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Dashboard() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const api = withAuth(token)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    api.get("/leaderboard").then(r => setLeaderboard(r.data.top || [])).catch(() => {})
  }, [])

  return (
    <div className="pt-16 px-6">
      <div className="glass p-6 rounded-2xl max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Dashboard</div>
          <button onClick={() => navigate("/game")} className="px-4 py-2 rounded bg-banana text-black">Start Game</button>
        </div>
        <div className="mt-6">
          <div className="text-lg mb-2">Leaderboard</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leaderboard.map((row, i) => (
              <div key={i} className="px-3 py-2 rounded bg-white/70 flex justify-between">
                <div>{row.player}</div>
                <div>{row.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
