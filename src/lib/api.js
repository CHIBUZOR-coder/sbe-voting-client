import axios from 'axios'
import useAuthStore from '../store/authStore'

/**
 * AXIOS INSTANCE
 * ─────────────────────────────────────────────────────────────
 * Central HTTP client for all API calls.
 *
 * Features:
 * - Base URL from .env
 * - Automatically attaches access token to every request
 * - Automatically refreshes token on 401 and retries
 * - Clears auth and redirects to login on refresh failure
 * - Skips refresh logic for auth endpoints
 * ─────────────────────────────────────────────────────────────
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// ── Auth endpoints that should never trigger token refresh ────
const AUTH_ENDPOINTS = [
  '/api/users/login',
  '/api/users/register',
  '/api/users/refresh',
  '/api/users/verify-email',
  '/api/users/forgot-password',
  '/api/users/reset-password'
]

const isAuthEndpoint = (url = '') =>
  AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint))

// ── Request Interceptor ───────────────────────────────────────
// Attaches access token to every request
api.interceptors.request.use(
  config => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ── Response Interceptor ──────────────────────────────────────
// On 401 — try to refresh token and retry the original request
// Skips auth endpoints entirely to avoid redirect loops
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,

  async error => {
    const originalRequest = error.config

    // ── Skip refresh for auth endpoints ───────────────────
    // Login/register/verify etc. handle their own errors.
    // Without this, a 401/403 from login triggers a refresh
    // attempt which fails, calls clearAuth() and redirects
    // to /login — wiping the error message entirely.
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    // ── Handle 401 for all other endpoints ────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken, setAccessToken, clearAuth } =
        useAuthStore.getState()

      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:5000'
          }/api/users/refresh`,
          { refreshToken }
        )

        const newAccessToken = response.data.accessToken
        setAccessToken(newAccessToken)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
