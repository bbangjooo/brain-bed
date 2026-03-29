/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-purple': {
          900: '#050510',
          800: '#131122',
          700: '#0c0b18',
        },
        'deep-blue': {
          900: '#0d1b2a',
          800: '#1b2838',
          700: '#2c3e50',
        },
        'deep-navy': {
          900: '#1a1a2e',
          800: '#16213e',
          700: '#0f3460',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 10s ease infinite',
        'fade-in': 'fade-in 0.8s ease-out',
        'fade-out': 'fade-out 0.8s ease-in',
        'quote-in': 'quote-in 1.5s ease-out',
        'quote-out': 'quote-out 1.5s ease-in',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'quote-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'quote-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
