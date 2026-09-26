/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lift-bg': '#F5F6F4',
        'lift-surface': '#FFFFFF',
        'lift-card': '#FFFFFF',
        'lift-border': '#E4E8E4',
        'lift-border-hover': '#D5DDD6',
        'lift-accent-3': '#247A50',
        'lift-accent-4': '#247A50',
        'lift-accent-orange': '#247A50',
        'lift-accent-purple': '#247A50',
        'lift-text': '#171B18',
        'lift-text-muted': '#59625C',
        'lift-text-dim': '#838B85',
        'lift-success-bg': '#EEF7F0',
        'lift-success-border': '#D5E9DA',
        'lift-success-text': '#347A4C',
        'lift-success-icon': '#3A9A5D',
        'lift-accent-3-bg': '#EAF4ED',
        'lift-accent-3-border': '#CDE3D3',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
