/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3F0E9', paper: '#FBFAF6', ink: '#141414', olive: '#3B3F34', sage: '#E3E8DA',
        lime: '#D1F462', line: '#DCD7CC', mute: '#6B685F', clay: '#B8A486', danger: '#9B2C1F',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: { card: '0 1px 2px rgba(20,20,20,.04), 0 8px 24px -12px rgba(20,20,20,.12)' },
    },
  },
  plugins: [],
};
