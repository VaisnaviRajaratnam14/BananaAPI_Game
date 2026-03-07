import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

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

  const value = useMemo(() => ({ 
    token, setToken, 
    mfaVerified, setMfaVerified,
    user, setUser
  }), [token, mfaVerified, user])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
