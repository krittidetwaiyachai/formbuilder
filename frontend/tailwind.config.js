/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    keyframes: {
      shimmer: {
        '100%': { transform: 'translateX(100%)' },
      },
      'spin-slow': {
        'to': { transform: 'rotate(360deg)' },
      },
      'pulse-ring': {
        '0%': { transform: 'scale(0.8)', opacity: '0.5' },
        '100%': { transform: 'scale(1.3)', opacity: '0' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-5px)' },
      },
      wiggle: {
        '0%, 100%': { transform: 'rotate(-3deg) scale(1)' },
        '50%': { transform: 'rotate(3deg) scale(1.2)' },
      },
    },
    animation: {
      shimmer: 'shimmer 1.5s infinite',
      'spin-slow': 'spin-slow 3s linear infinite',
      'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      float: 'float 3s ease-in-out infinite',
      wiggle: 'wiggle 1s ease-in-out infinite',
    },
    extend: {},
  },
  plugins: [],
}
