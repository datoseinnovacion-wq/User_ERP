/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkred: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
        },
        ink: {
          DEFAULT: '#18181B',
          soft: '#27272A',
          muted: '#71717A',
        },
        paper: {
          DEFAULT: '#F8F9FA',
          soft: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
