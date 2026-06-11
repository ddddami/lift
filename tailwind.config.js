/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lift-bg': '#080808',
        'lift-surface': '#111111',
        'lift-card': '#0F0F0F',
        'lift-border': '#161616',
        'lift-border-hover': '#1A1A1A',
        'lift-accent-3': '#E8FF3D',
        'lift-accent-4': '#00C9A7',
        'lift-accent-orange': '#FF6B35',
        'lift-accent-purple': '#7B5CF0',
        'lift-text': '#F0F0F0',
        'lift-text-muted': '#999999',
        'lift-text-dim': '#555555',
        'lift-success-bg': '#0F1A0F',
        'lift-success-border': '#1A3A1A',
        'lift-success-text': '#4A8A4A',
        'lift-success-icon': '#2A7A2A',
        'lift-accent-3-bg': '#E8FF3D18',
        'lift-accent-3-border': '#E8FF3D44',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
