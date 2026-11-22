/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc4fb',
          400: '#36a5f7',
          500: '#0c87eb',
          600: '#006bc9',
          700: '#0155a3',
          800: '#064886',
          900: '#0b3d6f',
          950: '#07264a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
