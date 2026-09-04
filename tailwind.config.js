/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cobat: {
          guinda: '#ab0033',
          'guinda-dark': '#8b002a',
          dorado: '#bc955c',
          'hover-bg': '#fce4ec',
          gris: '#54565a',
          bg: '#f4f6f8'
        }
      },
      fontFamily: {
        sans: ['Encode Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
