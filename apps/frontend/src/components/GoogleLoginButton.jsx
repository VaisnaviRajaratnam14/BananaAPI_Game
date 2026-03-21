import React, { useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"

const googleClientId = (
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.GOOGLE_CLIENT_ID ||
  ""
).trim()

function isClientIdConfigured(value) {
  if (!value) return false
  const normalized = value.toLowerCase()
  if (normalized.includes("your_google_client_id")) return false
  if (normalized.includes("your_google_web_client_id")) return false
  if (normalized.includes("your-id-here")) return false
  return true
}

export default function GoogleLoginButton({
  disabled = false,
  onCredentialResponse,
  onLoginError,
}) {
  const { language } = useLanguage()
  const buttonRef = useRef(null)
  const credentialHandlerRef = useRef(onCredentialResponse)
  const errorHandlerRef = useRef(onLoginError)

  // Match Google button language with selected app language.
  const googleLocale = language === "ta" ? "ta" : language === "si" ? "si" : "en"

  useEffect(() => {
    credentialHandlerRef.current = onCredentialResponse
    errorHandlerRef.current = onLoginError
  }, [onCredentialResponse, onLoginError])

  useEffect(() => {
    if (disabled) return
    if (!isClientIdConfigured(googleClientId)) {
      onLoginError?.("Google client ID is missing")
      return
    }

    let cancelled = false

    const loadGoogleScript = (locale) => {
      return new Promise((resolve, reject) => {
        const scriptId = "banana-google-gsi-client"
        const current = document.getElementById(scriptId)

        if (current && current.getAttribute("data-locale") !== locale) {
          current.remove()
          try {
            delete window.google
          } catch (_) {
            window.google = undefined
          }
        }

        if (window.google?.accounts?.id) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.id = scriptId
        script.src = `https://accounts.google.com/gsi/client?hl=${locale}`
        script.async = true
        script.defer = true
        script.setAttribute("data-locale", locale)
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Google script did not load"))
        document.body.appendChild(script)
      })
    }

    const initGoogle = async () => {
      try {
        await loadGoogleScript(googleLocale)
        if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return

        const credentialCallback = (credentialResponse) => {
          if (!credentialResponse?.credential) {
            errorHandlerRef.current?.("Google did not return a credential")
            return
          }
          credentialHandlerRef.current?.(credentialResponse)
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: credentialCallback,
          auto_select: false,
        })

        buttonRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: "320",
        })
      } catch (err) {
        errorHandlerRef.current?.(err?.message || "Google script did not load")
      }
    }

    initGoogle()

    return () => {
      cancelled = true
    }
  }, [disabled, googleLocale])

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
    <div className="flex justify-center" ref={buttonRef} />
  )
}
