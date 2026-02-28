import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || "")
  const [mfaVerified, setMfaVerified] = useState(() => localStorage.getItem("mfaVerified") === "true")

  useEffect(() => {
    if (token) localStorage.setItem("jwt", token)
    else localStorage.removeItem("jwt")
  }, [token])

  useEffect(() => {
    localStorage.setItem("mfaVerified", String(mfaVerified))
  }, [mfaVerified])

  const value = useMemo(() => ({ token, setToken, mfaVerified, setMfaVerified }), [token, mfaVerified])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
