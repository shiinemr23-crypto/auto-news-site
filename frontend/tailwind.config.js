/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Playfair Display"', 'Georgia', 'serif'], sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { ink: '#141414', paper: '#f7f5f0', moss: '#1d5b52', coral: '#e85d3f', mist: '#ebe8e0' },
      boxShadow: { card: '0 12px 32px rgba(20, 20, 20, .08)' },
    },
  },
  plugins: [],
}
