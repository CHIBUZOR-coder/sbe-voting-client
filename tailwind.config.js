/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1'
        },
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        green: '0 4px 14px 0 rgba(22,163,74,0.25)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      transitionDuration: {
        250: '250ms'
      }
    }
  },
  plugins: []
}
