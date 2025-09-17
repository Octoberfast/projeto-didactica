/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7c3aed',
        'brand-purple-dark': '#6d28d9',
        'brand-purple-light': '#ede9fe',
        'custom-purple': '#604c8c',
        'custom-orange': '#ed1b24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
