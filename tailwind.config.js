/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'atkinson': ['Atkinson Hyperlegible', 'sans-serif'],
        'opendyslexic': ['OpenDyslexic', 'sans-serif'],
      },
      colors: {
        'dsa-cream': '#FEFCF7',
        'dsa-warm-white': '#FFFEF7',
        'dsa-text': '#1A1A1A',
        'dsa-text-muted': '#6B7280',
        'dsa-blue': '#3B82F6',
        'dsa-blue-dark': '#1D4ED8',
        'dsa-green': '#10B981',
        'dsa-red': '#EF4444',
        'dsa-yellow': '#F59E0B',
        'dsa-purple': '#8B5CF6',
        'dsa-border': '#E5E7EB',
      },
      boxShadow: {
        'dsa': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'dsa-lg': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
