import React from "react"
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Register from "./pages/Register"
import Otp from "./pages/Otp"
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import Game from "./pages/Game"
import Result from "./pages/Result"
import Leaderboard from "./pages/Leaderboard"
import Account from "./pages/Account"
import IntroVideo from "./pages/IntroVideo"
import BackgroundMusic from "./components/BackgroundMusic"
import LanguageSwitcher from "./components/LanguageSwitcher"
import { LanguageProvider } from "./context/LanguageContext"

function Protected({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  // MFA (Otp) is not implemented in Django backend yet, so bypassing for now
  // if (!mfaVerified) return <Navigate to="/otp" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === "/login" || location.pathname === "/forgot" || location.pathname === "/reset-password" || location.pathname === "/game" || location.pathname === "/account" || location.pathname === "/dashboard" || location.pathname === "/home"
  const wrapperClass = `min-h-screen ${hideNav ? "bg-hero" : "bg-animated"}`
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className={wrapperClass}>
          <BackgroundMusic />
          <LanguageSwitcher />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/intro" element={<Protected><IntroVideo /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/home" element={<Protected><Home /></Protected>} />
            <Route path="/game" element={<Protected><Game /></Protected>} />
            <Route path="/result" element={<Protected><Result /></Protected>} />
            <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
            <Route path="/account" element={<Protected><Account /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
