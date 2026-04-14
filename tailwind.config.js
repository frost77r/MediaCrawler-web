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
          DEFAULT: '#0f172a',
          glass: 'rgba(15, 23, 42, 0.8)',
          border: 'rgba(51, 65, 85, 0.5)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}
