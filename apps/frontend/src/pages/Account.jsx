﻿import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { withAuth } from "../utils/api"
import profileBg from "../assets/profile.avif"

const LG = { fontFamily: "'Luckiest Guy', cursive" }

export default function Account() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { token, user, setUser, logout } = useAuth()
  const api = withAuth(token)

  const profile = user?.profile || { diamonds: 0, total_marks: 0, rank: "", current_level: 1, gifts: 0 }
  const userLevels = user?.levels || []
  const totalStars = Number(user?.total_stars || 0)

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  const playedLevels = userLevels
    .filter(l => l.total_time_seconds > 0 || l.stars_earned > 0)
    .sort((a, b) => a.level_number - b.level_number)

  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    username: user?.username || "",
    avatar: profile.avatar || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        setError(t("account.imageTooLarge", "Image is too large! Please choose a smaller one (Max 1MB)."))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result })
      reader.readAsDataURL(file)
    }
  }

  async function handleProfileSave() {
    setLoading(true); setError(""); setSuccess("")
    try {
      const res = await api.patch("user/update/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        profile: { nickname: formData.username, avatar: formData.avatar }
      })
      setUser(res.data)
      setSuccess(t("account.profileUpdated", "Profile updated!"))
      setTimeout(() => setEditMode(null), 1000)
    } catch (err) {
      const serverError = err?.response?.data
      if (serverError) {
        const firstKey = Object.keys(serverError)[0]
        const firstError = serverError[firstKey]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError(t("account.updateFailed", "Update failed"))
      }
    } finally { setLoading(false) }
  }

  async function handlePasswordSave() {
    if (formData.newPassword !== formData.confirmPassword) return setError(t("account.passwordsNoMatch", "Passwords do not match"))
    setLoading(true); setError(""); setSuccess("")
    try {
      await api.post("auth/password/", { currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      setSuccess(t("account.passwordChanged", "Password changed!"))
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setEditMode(null), 1000)
    } catch (err) {
      setError(err.response?.data?.error || t("account.changeFailed", "Change failed"))
    } finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 relative"
      style={{ backgroundImage: `url(${profileBg})`, backgroundSize: "cover", backgroundPosition: "center", ...LG }}
    >
      <div className="absolute inset-0 bg-[#07122d]/70" />

      <div className="relative z-10">
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 uppercase hover:scale-105 transition-transform"
          style={{ ...LG, color: "#4aeadc", textShadow: "2px 2px 0 #0a3d38", letterSpacing: "0.05em", fontSize: "1rem" }}
        >
          <span className="text-2xl">&#8592;</span> {t("account.backToMap", "Back to Map")}
        </button>

        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0a1c3d]/90 backdrop-blur-md p-8 rounded-[3rem] border-8 border-cyan-500 shadow-[0_15px_0_0_#041229] relative overflow-hidden">

            {!editMode && (
              <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b-4 border-cyan-400/30">
                <div className="w-24 h-24 bg-orange-500 rounded-full border-4 border-cyan-300 shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1
                    className="uppercase leading-none mb-1"
                    style={{
                      ...LG,
                      fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
                      color: "#4aeadc",
                      WebkitTextStroke: "2px #0a3d38",
                      textShadow: "3px 3px 0 #0a3d38, 5px 5px 0 #041f1c, 0 0 20px rgba(74,234,220,0.5)",
                      letterSpacing: "0.04em"
                    }}
                  >
                    {user?.username || t("common.guest", "Guest")}
                  </h1>
                </div>
                <button
                  onClick={() => setEditMode("profile")}
                  className="bg-orange-500 hover:bg-orange-400 text-white p-3 rounded-xl border-4 border-orange-700 shadow-[0_4px_0_0_#041229] active:translate-y-1 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}

            {editMode === "profile" && (
              <div className="mb-10 animate-in slide-in-from-top duration-300">
                <h2 className="text-2xl uppercase mb-6 text-center" style={{ ...LG, color: "#ffa733", WebkitTextStroke: "1px #7d3a00", textShadow: "2px 2px 0 #7d3a00, 4px 4px 0 #3d1c00", letterSpacing: "0.05em" }}>
                  {t("account.editProfile", "Edit Profile")}
                </h2>
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-[#0a2f5e] rounded-full border-8 border-cyan-500 shadow-xl flex items-center justify-center overflow-hidden">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="New Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-20 h-20 text-cyan-200/30" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <span className="text-xs uppercase" style={LG}>{t("account.changeImage", "Change Image")}</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <p className="text-white/40 text-[8px] uppercase" style={LG}>{t("account.touchUpload", "Touch image to upload (Max 1MB)")}</p>
                    {formData.avatar && (
                      <button onClick={() => setFormData({...formData, avatar: ""})} className="text-red-400 text-[8px] uppercase hover:underline" style={LG}>{t("account.remove", "Remove")}</button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase mb-1 block ml-2" style={{ ...LG, color: "rgba(165,243,252,0.7)" }}>{t("account.nickname", "Nickname (Username)")}</label>
                    <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toUpperCase()})}
                      className="w-full bg-[#071428] text-cyan-100 border-4 border-cyan-500/60 rounded-xl p-3 outline-none placeholder-white/30"
                      style={{ ...LG, letterSpacing: "0.05em" }} placeholder={t("account.chooseCoolName", "CHOOSE A COOL NAME")} />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase mb-1 block ml-2" style={{ ...LG, color: "rgba(165,243,252,0.7)" }}>{t("account.firstName", "First Name")}</label>
                      <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-[#071428] text-cyan-100 border-4 border-cyan-500/60 rounded-xl p-3 outline-none" style={LG} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] uppercase mb-1 block ml-2" style={{ ...LG, color: "rgba(165,243,252,0.7)" }}>{t("account.lastName", "Last Name")}</label>
                      <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-[#071428] text-cyan-100 border-4 border-cyan-500/60 rounded-xl p-3 outline-none" style={LG} />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setEditMode(null)} className="flex-1 bg-[#0a2f5e] text-cyan-200 py-3 rounded-xl border-4 border-cyan-700 shadow-[0_4px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.05em" }}>{t("common.cancel", "Cancel")}</button>
                    <button onClick={handleProfileSave} disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#07122d] py-3 px-8 rounded-xl border-4 border-cyan-700 shadow-[0_4px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.05em" }}>
                      {loading ? t("account.saving", "Saving...") : t("account.saveProfile", "Save Profile")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editMode === "password" && (
              <div className="mb-10 animate-in slide-in-from-top duration-300">
                <h2 className="text-2xl uppercase mb-6 text-center" style={{ ...LG, color: "#4aeadc", WebkitTextStroke: "1px #0a3d38", textShadow: "2px 2px 0 #0a3d38, 4px 4px 0 #041f1c", letterSpacing: "0.05em" }}>
                  {t("account.security", "Security")}
                </h2>
                <div className="space-y-4">
                  {[[t("account.currentPassword", "Current Password"),"currentPassword"],[t("account.newPassword", "New Password"),"newPassword"],[t("account.confirmPassword", "Confirm Password"),"confirmPassword"]].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-[10px] uppercase mb-1 block ml-2" style={{ ...LG, color: "rgba(165,243,252,0.7)" }}>{label}</label>
                      <input type="password" value={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}
                        className="w-full bg-[#071428] text-cyan-100 border-4 border-cyan-500/60 rounded-xl p-3 outline-none" style={LG} />
                    </div>
                  ))}
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setEditMode(null)} className="flex-1 bg-[#0a2f5e] text-cyan-200 py-3 rounded-xl border-4 border-cyan-700 shadow-[0_4px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.05em" }}>{t("common.cancel", "Cancel")}</button>
                    <button onClick={handlePasswordSave} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-3 px-8 rounded-xl border-4 border-orange-700 shadow-[0_4px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.05em" }}>
                      {loading ? t("account.changing", "Changing...") : t("account.updatePassword", "Update Password")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!editMode && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {[
                    [t("account.fullName", "Full Name"), `${user?.first_name || "NOT"} ${user?.last_name || t("account.notSet", "SET")}`],
                    [t("account.emailAddress", "Email Address"), user?.email || t("account.na", "N/A")],
                    [t("account.currentLevel", "Current Level"), `${t("account.level", "Level")} ${profile.current_level}`],
                    [t("account.totalScore", "Total Score"), `${profile.total_marks} ${t("account.points", "Points")}`]
                  ].map(([label, value]) => (
                    <div key={label} className="bg-white/95 p-4 rounded-2xl border-4 border-cyan-300 shadow-[inset_0_4px_0_0_rgba(0,0,0,0.08)]">
                      <span className="block text-[10px] uppercase mb-1" style={{ ...LG, color: "rgba(10,47,94,0.6)", letterSpacing: "0.06em" }}>{label}</span>
                      <span className="text-lg uppercase block truncate" style={{ ...LG, color: "#0a2f5e", letterSpacing: "0.04em" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-10">
                  {[
                    ["bg-cyan-500","border-cyan-700","text-white","⭐",profile.diamonds],
                    ["bg-[#0a2f5e]","border-cyan-500","text-cyan-200","🎁",profile.gifts],
                    ["bg-orange-500","border-orange-700","text-white","🎮",`Lv.${profile.current_level}`]
                  ].map(([bg, border, color, icon, val]) => (
                    <div key={icon} className={`flex items-center gap-2 px-4 py-2 ${bg} rounded-xl border-4 ${border} shadow-[0_4px_0_0_#041229] ${color}`} style={{ ...LG, letterSpacing: "0.05em", fontSize: "1.1rem" }}>
                      <span>{icon}</span> {val}
                    </div>
                  ))}
                </div>

                {playedLevels.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-sm uppercase mb-4 text-center" style={{ ...LG, color: "#4aeadc", textShadow: "1px 1px 0 #0a3d38", letterSpacing: "0.08em" }}>
                      ─── {t("account.levelHistory", "Level History")} ───
                    </h3>
                    <div className="rounded-2xl overflow-hidden border-4 border-cyan-500/40">
                      <div className="grid grid-cols-4 bg-[#0a2f5e] px-4 py-2">
                        {[[t("account.level", "Level"),""],[t("account.time", "Time"),"text-center"],[t("account.stars", "Stars"),"text-center"],[t("account.status", "Status"),"text-right"]].map(([h, align]) => (
                          <span key={h} className={`text-[10px] uppercase ${align}`} style={{ ...LG, color: "#67e8f9", letterSpacing: "0.06em" }}>{h}</span>
                        ))}
                      </div>
                      {playedLevels.map((lvl, idx) => (
                        <div key={lvl.level_number} className={`grid grid-cols-4 px-4 py-3 items-center border-t-2 border-cyan-500/20 ${idx % 2 === 0 ? "bg-[#071428]" : "bg-[#0a1c3d]"}`}>
                          <span className="text-sm uppercase" style={{ ...LG, color: "white", letterSpacing: "0.04em" }}>Lv.{lvl.level_number}</span>
                          <span className="text-sm text-center" style={{ ...LG, color: "#a5f3fc", letterSpacing: "0.04em" }}>{lvl.total_time_seconds > 0 ? formatTime(lvl.total_time_seconds) : "--:--"}</span>
                          <span className="text-sm text-center">
                            {[1,2,3].map(i => <span key={i} className={i <= Math.round(lvl.stars_earned) ? "text-orange-400" : "text-white/20"}>&#9733;</span>)}
                          </span>
                          <span className="text-right">
                            {lvl.stars_earned >= 2.5 && lvl.total_time_seconds > 0
                              ? <span className="text-[10px] uppercase px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/40" style={{ ...LG, textShadow: "0 0 8px rgba(74,234,220,0.6)" }}>{t("account.perfect", "Perfect")}</span>
                              : lvl.stars_earned >= 1
                              ? <span className="text-[10px] uppercase px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg border border-orange-500/40" style={LG}>{t("account.done", "Done")}</span>
                              : <span className="text-[10px] uppercase px-2 py-1 bg-white/10 text-white/40 rounded-lg border border-white/20" style={LG}>{t("account.tried", "Tried")}</span>
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {error   && <div className="bg-red-500/20 border-2 border-red-500 text-red-200 p-3 rounded-xl mb-6 text-center uppercase text-xs" style={{ ...LG, letterSpacing: "0.05em" }}>&#9888; {error}</div>}
            {success && <div className="bg-green-500/20 border-2 border-green-500 text-green-200 p-3 rounded-xl mb-6 text-center uppercase text-xs" style={{ ...LG, letterSpacing: "0.05em" }}>&#10003; {success}</div>}

            {!editMode && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button onClick={() => setEditMode("profile")} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#07122d] py-4 rounded-2xl border-4 border-cyan-700 shadow-[0_6px_0_0_#041229] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.06em", fontSize: "1.1rem" }}>
                    {t("account.editProfile", "Edit Profile")}
                  </button>
                  <button onClick={() => setEditMode("password")} className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-2xl border-4 border-orange-700 shadow-[0_6px_0_0_#041229] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.06em", fontSize: "1.1rem" }}>
                    {t("account.password", "Password")}
                  </button>
                </div>
                <button onClick={() => { logout(); navigate("/login") }} className="w-full bg-[#0a1c3d] hover:bg-[#112755] text-orange-300 py-4 rounded-2xl border-4 border-orange-500 shadow-[0_6px_0_0_#041229] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#041229] uppercase" style={{ ...LG, letterSpacing: "0.06em", fontSize: "1.1rem" }}>
                  {t("account.logoutAccount", "Logout Account")}
                </button>
              </div>
            )}

            <div className="absolute top-1/4 left-0 w-4 h-1 bg-cyan-400 opacity-20"></div>
            <div className="absolute bottom-1/3 right-0 w-6 h-1 bg-orange-400 opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
