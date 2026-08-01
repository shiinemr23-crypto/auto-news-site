/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"DM Serif Display"', 'Georgia', 'serif'], sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { ink: '#17201b', paper: '#f8f6f0', moss: '#245741', coral: '#e4654e', mist: '#e8eee9' },
      boxShadow: { card: '0 10px 30px rgba(26, 39, 31, .08)' },
    },
  },
  plugins: [],
}
