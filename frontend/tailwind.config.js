/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Salesforce brand colours
        sf: {
          blue:   '#0176D3',
          navy:   '#032D60',
          accent: '#1B96FF',
          pale:   '#EAF5FE',
        },
        // Brand aliases used throughout the UI
        // (aliased here so both sf-* and brand-* classes work)
        brand: {
          bg:        '#F8FAFC',
          text:      '#172B4D',
          navy:      '#032D60',  // alias for sf-navy
          blue:      '#0176D3',  // alias for sf-blue
          secondary: '#526581',
          border:    '#E5EAF0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Subtle elevation levels for the 3-D card system
        'card':    '0 1px 3px rgba(3,45,96,0.06), 0 4px 12px rgba(3,45,96,0.04)',
        'card-md': '0 4px 16px rgba(3,45,96,0.10), 0 1px 4px rgba(3,45,96,0.06)',
        'card-lg': '0 8px 32px rgba(3,45,96,0.14), 0 2px 8px rgba(3,45,96,0.08)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #032D60 0%, #0176D3 100%)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
