/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'sun-shine': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'moon-eclipse': {
          '0%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(2px) scale(0.9)' },
          '100%': { transform: 'translateX(0) scale(1)' },
        }
      },
      animation: {
        'sun-shine': 'sun-shine 2s infinite linear',
        'moon-eclipse': 'moon-eclipse 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
