import React, { useState } from "react"
import { GoogleLogin } from "@react-oauth/google"
import { api } from "../utils/api"

export default function GoogleLoginButton({
  disabled = false,
  onLoginSuccess,
  onLoginError,
}) {
  const [loading, setLoading] = useState(false)

  async function handleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      onLoginError?.("Google did not return a credential")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("auth/google/", {
        id_token: credentialResponse.credential,
      })
      onLoginSuccess?.(res.data)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Google login failed"
      onLoginError?.(String(msg))
    } finally {
      setLoading(false)
    }
  }

  function handleError() {
    onLoginError?.("Google sign-in popup failed or was closed")
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="w-full bg-[#071428] text-cyan-300/60 px-6 py-3 rounded-2xl border-2 border-cyan-500/40 font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="text-base">G</span>
        <span>Login with Google</span>
      </button>
    )
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
        width="320"
        useOneTap={false}
      />
      {loading && (
        <div className="absolute mt-14 text-xs text-cyan-200/80 font-bold uppercase tracking-wider text-center">
          Verifying Google account...
        </div>
      )}
    </div>
  )
}
