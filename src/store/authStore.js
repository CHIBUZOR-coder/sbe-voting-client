import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * AUTH STORE
 * ─────────────────────────────────────────────────────────────
 * Manages logged-in user state and tokens.
 * Persisted in localStorage so user stays logged in on refresh.
 * ─────────────────────────────────────────────────────────────
 */
const useAuthStore = create(
  persist(
    set => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Called after successful login
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      // Called after token refresh — only updates access token
      setAccessToken: accessToken => {
        set({ accessToken })
      },

      // Called after profile update
      setUser: user => {
        set({ user })
      },

      // Called on logout
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'sbe-auth' // localStorage key
    }
  )
)

export default useAuthStore
