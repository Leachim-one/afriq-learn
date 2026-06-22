/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#4fd98a',
          400: '#34c471',
          500: '#25a267',
          600: '#1d8a57',
          700: '#166b43',
        },
        dark: {
          600: '#1a2820',
          700: '#111a15',
          800: '#0d1510',
          900: '#0a0f0d',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
