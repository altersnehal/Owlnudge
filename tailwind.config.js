/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e4cd',
          300: '#99cfab',
          400: '#67b382',
          500: '#419760',
          600: '#2f794b',
          700: '#26603d',
          800: '#14532d',
          900: '#0f3d23',
          950: '#092615',
        },
        owlGreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
        butterYellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        creamBg: '#f8faf7',
      },
      boxShadow: {
        'pill': '0 4px 14px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        'mascot': '0 12px 30px -4px rgba(34, 197, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
