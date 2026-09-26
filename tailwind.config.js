/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lift-bg': '#F4F4F2',
        'lift-inset': '#F1F1F3',
        'lift-border': '#E7E7E9',
        'lift-accent-3': '#238449',
        'lift-accent-orange': '#F39A43',
        'lift-text': '#111114',
        'lift-text-muted': '#66666D',
        'lift-text-dim': '#6D6D73',
        'lift-success-bg': '#E8F6EC',
        'lift-success-text': '#238449',
        'lift-activity-empty': '#E3E4E6',
        'lift-activity-light': '#DDF2E3',
        'lift-activity-medium': '#AFE0BC',
        'lift-notice-bg': '#FFF4E4',
        'lift-notice-text': '#684D2E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
