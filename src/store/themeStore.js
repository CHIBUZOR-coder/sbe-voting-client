import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * THEME STORE
 * ─────────────────────────────────────────────────────────────
 * Manages dark/light mode toggle.
 * Uses zustand/persist to save preference in localStorage
 * so the theme survives page refresh.
 * ─────────────────────────────────────────────────────────────
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      // Toggle between dark and light
      toggleTheme: () => {
        const newIsDark = !get().isDark
        set({ isDark: newIsDark })

        // Add or remove 'dark' class on <html> element
        // Tailwind's darkMode: 'class' watches for this
        if (newIsDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      // Called on app startup to apply saved theme
      applyTheme: () => {
        const { isDark } = get()
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }),
    {
      name: 'sbe-theme' // localStorage key
    }
  )
)

export default useThemeStore
