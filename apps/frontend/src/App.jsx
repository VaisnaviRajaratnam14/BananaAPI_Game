import React from "react"
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Otp from "./pages/Otp"
import SetUsername from "./pages/SetUsername"
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import Game from "./pages/Game"
import Account from "./pages/Account"
import ThemeSwitcher from "./components/ThemeSwitcher"

function Protected({ children }) {
  const { token, mfaVerified, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!mfaVerified) return <Navigate to="/otp" replace />
  if (!user?.username && window.location.pathname !== "/setup") return <Navigate to="/setup" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === "/login" || location.pathname === "/game" || location.pathname === "/setup" || location.pathname === "/dashboard" || location.pathname === "/home"
  const wrapperClass = `min-h-screen ${hideNav ? "bg-hero" : "bg-animated"}`
  return (
    <AuthProvider>
      <div className={wrapperClass}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/setup" element={<Protected><SetUsername /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/home" element={<Protected><Home /></Protected>} />
          <Route path="/game" element={<Protected><Game /></Protected>} />
          <Route path="/account" element={<Protected><Account /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
