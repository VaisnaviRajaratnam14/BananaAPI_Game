import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5080"
export const api = axios.create({ baseURL })

export function withAuth(token) {
  const instance = axios.create({ baseURL })
  instance.interceptors.request.use(config => {
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
  return instance
}
