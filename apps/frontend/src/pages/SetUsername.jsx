import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function SetUsername() {
  const { token, setUser } = useAuth()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const api = withAuth(token)

  async function handleSave() {
    if (!username) return
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/username", { username })
      setUser(res.data)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-8">Create Account</h1>
        
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-slate-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-500">
            <svg className="w-20 h-20 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Vaisu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-700 text-white px-6 py-4 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none transition-all text-center text-lg"
            />
          </div>
          
          <p className="text-slate-400 text-sm px-4">
            Choose wisely! Your username will be permanent and can't be changed later.
          </p>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={loading || !username}
              className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = "/login"
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
