import React, { useEffect, useRef } from "react"

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
  const buttonRef = useRef(null)
  const credentialHandlerRef = useRef(onCredentialResponse)
  const errorHandlerRef = useRef(onLoginError)

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
    let poll = null

    const initGoogle = () => {
      if (cancelled) return
      if (!window.google?.accounts?.id || !buttonRef.current) return

      if (!window.__bananaGoogleCredentialCallback) {
        window.__bananaGoogleCredentialCallback = (credentialResponse) => {
          if (!credentialResponse?.credential) {
            errorHandlerRef.current?.("Google did not return a credential")
            return
          }
          credentialHandlerRef.current?.(credentialResponse)
        }
      }

      if (!window.__bananaGoogleInitialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: window.__bananaGoogleCredentialCallback,
          auto_select: false,
        })
        window.__bananaGoogleInitialized = true
      }

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

      if (poll) {
        window.clearInterval(poll)
        poll = null
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      poll = window.setInterval(() => {
        if (!window.google?.accounts?.id) {
          return
        }
        initGoogle()
      }, 200)

      const timeout = window.setTimeout(() => {
        if (!window.google?.accounts?.id) {
          if (poll) {
            window.clearInterval(poll)
            poll = null
          }
          errorHandlerRef.current?.("Google script did not load")
        }
      }, 8000)

      return () => {
        cancelled = true
        if (poll) {
          window.clearInterval(poll)
          poll = null
        }
        window.clearTimeout(timeout)
      }
    }

    return () => {
      cancelled = true
      if (poll) {
        window.clearInterval(poll)
      }
    }
  }, [disabled])

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
