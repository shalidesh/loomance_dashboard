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
        charcoal: {
          DEFAULT: 'rgb(var(--color-charcoal) / <alpha-value>)',
          light: 'rgb(var(--color-charcoal-light) / <alpha-value>)',
          lighter: 'rgb(var(--color-charcoal-lighter) / <alpha-value>)',
        },
        cream: {
          DEFAULT: 'rgb(var(--color-cream) / <alpha-value>)',
          muted: 'rgb(var(--color-cream-muted) / <alpha-value>)',
          dark: 'rgb(var(--color-cream-dark) / <alpha-value>)',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e0c99a',
          dark: '#a07840',
        },
      },
      fontFamily: {
        serif: ['"Roboto Slab"', 'Georgia', 'serif'],
        sans: ['"Roboto"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
