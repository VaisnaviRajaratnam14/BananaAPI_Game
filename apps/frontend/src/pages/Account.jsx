import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { withAuth } from "../utils/api"

export default function Account() {
  const navigate = useNavigate()
  const { token, user, setUser, logout } = useAuth()
  const api = withAuth(token)
  
  // Django structure: user.profile and user.levels
  const profile = user?.profile || { diamonds: 0, total_marks: 0, rank: "Novice", current_level: 1, gifts: 0 }
  const userLevels = user?.levels || []

  // Calculate total stars earned
  const totalStars = userLevels.reduce((acc, l) => acc + l.stars_earned, 0)

  const [editMode, setEditMode] = useState(null) // 'profile' or 'password'
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
      if (file.size > 1024 * 1024) { // 1MB limit for base64 storage
        setError("Image is too large! Please choose a smaller one (Max 1MB).")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleProfileSave() {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await api.patch("user/update/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        profile: {
          nickname: formData.username,
          avatar: formData.avatar
        }
      })
      setUser(res.data)
      setSuccess("Profile updated!")
      setTimeout(() => setEditMode(null), 1000)
    } catch (err) {
      const serverError = err?.response?.data
      if (serverError) {
        const firstKey = Object.keys(serverError)[0]
        const firstError = serverError[firstKey]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError("Update failed")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSave() {
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match")
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      // Django password change endpoint (assuming one exists or needs implementation)
      await api.post("auth/password/", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      setSuccess("Password changed!")
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setEditMode(null), 1000)
    } catch (err) {
      setError(err.response?.data?.error || "Change failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#a8d18d] p-4 md:p-8 font-mono">
      <button 
        onClick={() => navigate("/home")}
        className="mb-6 flex items-center gap-2 text-[#5d3a1a] font-black italic uppercase hover:scale-105 transition-transform"
      >
        <span className="text-2xl">←</span> Back to Map
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-[#8b5a2b] p-8 rounded-[3rem] border-8 border-[#5d3a1a] shadow-[0_15px_0_0_#3d2611] relative overflow-hidden">
          
          {!editMode && (
            <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b-4 border-[#5d3a1a]/30">
              <div className="w-24 h-24 bg-pink-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-white text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">
                  {user?.username || "GUEST"}
                </h1>
                <p className="text-pink-400 text-xl font-bold italic uppercase tracking-widest">
                  {profile.rank}
                </p>
              </div>
              <button 
                onClick={() => setEditMode('profile')}
                className="bg-yellow-500 hover:bg-yellow-400 text-[#5d3a1a] p-3 rounded-xl border-4 border-[#a16207] shadow-[0_4px_0_0_#a16207] active:translate-y-1 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}

          {editMode === 'profile' && (
            <div className="mb-10 animate-in slide-in-from-top duration-300">
              <h2 className="text-white text-2xl font-black italic uppercase mb-6 text-center">Edit Profile</h2>
              
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 bg-[#e8e8e8] rounded-full border-8 border-[#5d3a1a] shadow-xl flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="New Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-20 h-20 text-[#5d3a1a]/30" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="font-black italic text-xs uppercase">Change Image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <div className="flex gap-2 mt-2">
                  <p className="text-white/40 text-[8px] font-black uppercase italic">Touch image to upload (Max 1MB)</p>
                  {formData.avatar && (
                    <button 
                      onClick={() => setFormData({...formData, avatar: ""})}
                      className="text-red-400 text-[8px] font-black uppercase italic hover:underline"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">Nickname (Username)</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value.toUpperCase()})}
                    className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                    placeholder="CHOOSE A COOL NAME"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEditMode(null)} className="flex-1 bg-slate-500 text-white font-black italic py-3 rounded-xl border-4 border-slate-700 shadow-[0_4px_0_0_#334155] uppercase">Cancel</button>
                  <button onClick={handleProfileSave} disabled={loading} className="flex-2 bg-[#4ba334] text-white font-black italic py-3 px-8 rounded-xl border-4 border-[#2d661e] shadow-[0_4px_0_0_#2d661e] uppercase">
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {editMode === 'password' && (
            <div className="mb-10 animate-in slide-in-from-top duration-300">
              <h2 className="text-white text-2xl font-black italic uppercase mb-6 text-center">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">Current Password</label>
                  <input 
                    type="password" 
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">New Password</label>
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-[10px] font-black uppercase italic mb-1 block ml-2">Confirm Password</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-[#e8e8e8] border-4 border-[#5d3a1a] rounded-xl p-3 text-[#5d3a1a] font-black italic outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEditMode(null)} className="flex-1 bg-slate-500 text-white font-black italic py-3 rounded-xl border-4 border-slate-700 shadow-[0_4px_0_0_#334155] uppercase">Cancel</button>
                  <button onClick={handlePasswordSave} disabled={loading} className="flex-2 bg-orange-500 text-white font-black italic py-3 px-8 rounded-xl border-4 border-orange-700 shadow-[0_4px_0_0_#c2410c] uppercase">
                    {loading ? "Changing..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!editMode && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
                  <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Full Name</span>
                  <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                    {user?.first_name || "NOT"} {user?.last_name || "SET"}
                  </span>
                </div>
                <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
                  <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Email Address</span>
                  <span className="text-[#5d3a1a] text-lg font-black italic uppercase truncate">
                    {user?.email || "N/A"}
                  </span>
                </div>
                <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
                  <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Current Level</span>
                  <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                    Level {profile.current_level}
                  </span>
                </div>
                <div className="bg-[#e8e8e8] p-4 rounded-2xl border-4 border-[#5d3a1a] shadow-[inset_0_4px_0_0_rgba(0,0,0,0.1)]">
                  <span className="block text-[#8b5a2b]/60 text-[10px] font-black uppercase italic mb-1">Total Score</span>
                  <span className="text-[#5d3a1a] text-lg font-black italic uppercase">
                    {profile.total_marks} Points
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-xl border-4 border-emerald-700 shadow-[0_4px_0_0_#047857] text-white font-black italic">
                  <span>💎</span> {profile.diamonds}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500 rounded-xl border-4 border-yellow-700 shadow-[0_4px_0_0_#a16207] text-white font-black italic">
                  <span>⭐</span> {totalStars}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-500 rounded-xl border-4 border-pink-700 shadow-[0_4px_0_0_#be123c] text-white font-black italic">
                  <span>🎁</span> {profile.gifts}
                </div>
              </div>
            </>
          )}

          {error && <div className="bg-red-500/20 border-2 border-red-500 text-red-200 p-3 rounded-xl mb-6 text-center font-black italic uppercase text-xs">⚠️ {error}</div>}
          {success && <div className="bg-green-500/20 border-2 border-green-500 text-green-200 p-3 rounded-xl mb-6 text-center font-black italic uppercase text-xs">✅ {success}</div>}

          {!editMode && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setEditMode('profile')}
                  className="flex-1 bg-[#4ba334] hover:bg-[#5bbd41] text-white font-black italic py-4 rounded-2xl border-4 border-[#2d661e] shadow-[0_6px_0_0_#2d661e] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#2d661e] uppercase"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setEditMode('password')}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-black italic py-4 rounded-2xl border-4 border-orange-700 shadow-[0_6px_0_0_#c2410c] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#c2410c] uppercase"
                >
                  Password
                </button>
              </div>
              <button
                onClick={() => { logout(); navigate("/login") }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black italic py-4 rounded-2xl border-4 border-red-800 shadow-[0_6px_0_0_#991b1b] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_#991b1b] uppercase"
              >
                Logout Account
              </button>
            </div>
          )}

          <div className="absolute top-1/4 left-0 w-4 h-1 bg-[#5d3a1a] opacity-30"></div>
          <div className="absolute bottom-1/3 right-0 w-6 h-1 bg-[#5d3a1a] opacity-30"></div>
        </div>
      </div>
    </div>
  )
}
