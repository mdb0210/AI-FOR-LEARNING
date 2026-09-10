/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vault: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b4c7fc',
          400: '#8ca6f9',
          500: '#6380f5',
          600: '#4a62eb',
          700: '#384cd3',
          800: '#2d3cae',
          900: '#273489',
          950: '#191f54',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'vault-glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'vault-sm': '0 2px 8px -1px rgba(15, 23, 42, 0.08), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
