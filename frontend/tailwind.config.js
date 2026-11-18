/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sf: {
          blue: '#0176D3',
          navy: '#032D60',
          accent: '#1B96FF',
          pale: '#EAF5FE',
        },
        brand: {
          bg: '#F8FAFC',
          text: '#172B4D',
          secondary: '#526581',
          border: '#E5EAF0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
