import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { withAuth } from "../utils/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || "")
  const [mfaVerified, setMfaVerified] = useState(() => localStorage.getItem("mfaVerified") === "true")
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user")
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem("jwt", token)
    else localStorage.removeItem("jwt")
  }, [token])

  useEffect(() => {
    localStorage.setItem("mfaVerified", String(mfaVerified))
  }, [mfaVerified])

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user))
    else localStorage.removeItem("user")
  }, [user])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function refreshUser() {
      try {
        const api = withAuth(token)
        const res = await api.get("user/stats/")
        if (!cancelled) setUser(res.data)
      } catch (error) {
        console.error("Failed to refresh user session:", error)
      }
    }

    refreshUser()

    return () => {
      cancelled = true
    }
  }, [token])

  const login = (newToken) => {
    setToken(newToken)
    setMfaVerified(true) // For now we bypass OTP
  }

  const logout = () => {
    setToken("")
    setMfaVerified(false)
    setUser(null)
    localStorage.removeItem("jwt")
    localStorage.removeItem("mfaVerified")
    localStorage.removeItem("user")
  }

  const value = useMemo(() => ({ 
    token, setToken, 
    mfaVerified, setMfaVerified,
    user, setUser,
    login, logout
  }), [token, mfaVerified, user])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
