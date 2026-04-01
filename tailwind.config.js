/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0f111a',
          glass: 'rgba(25, 28, 41, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        accent: {
          DEFAULT: '#6d28d9',
          hover: '#7c3aed',
        }
      }
    },
  },
  plugins: [],
}
