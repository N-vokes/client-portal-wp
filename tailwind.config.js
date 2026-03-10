/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Serene Sophistication palette
        cream: '#FAF8F6',
        sand: '#F5EFE8',
        taupe: '#D4CBBF',
        gold: '#C9B8A3',
        blush: '#E8D5CC',
        slate: '#8B8680',
        charcoal: '#4A4A48',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '28': '7rem',
        '32': '8rem',
      },
    },
  },
  plugins: [],
}
