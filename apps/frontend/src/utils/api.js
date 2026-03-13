import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/"
export const api = axios.create({ baseURL })

export function withAuth(token) {
  const instance = axios.create({ baseURL })
  
  instance.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  
  instance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
      // If the error is due to an expired or invalid token, log the user out
      if (error.response && error.response.status === 401) {
        console.warn("Session expired or token is invalid. Logging out.")
        // Clear local storage and redirect to login
        localStorage.clear()
        window.location.href = "/login?reason=session_expired"
      }
      return Promise.reject(error)
    }
  )
  
  return instance
}
