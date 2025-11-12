/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        display: ['"Satoshi Variable"', ...fontFamily.sans],
      },
      colors: {
        page: '#050711',
        surface: {
          50: '#070a16',
          100: '#0b101d',
          150: '#111726',
          200: '#161d2f',
          250: '#1c243a',
          300: '#232d46',
        },
        text: {
          DEFAULT: '#f4f5f8',
          muted: '#9ea7bd',
          subtle: '#6f7c94',
          inverse: '#0b101d',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        border: {
          DEFAULT: '#273041',
          subtle: '#1b2231',
        },
        overlay: {
          500: 'rgba(4, 7, 17, 0.6)',
          600: 'rgba(4, 7, 17, 0.7)',
          700: 'rgba(4, 7, 17, 0.8)',
          900: 'rgba(4, 7, 17, 0.92)',
        },
      },
      boxShadow: {
        glow: '0 24px 70px -30px rgba(99, 102, 241, 0.45)',
        card: '0 20px 45px -28px rgba(15, 23, 42, 0.75)',
        'card-hover': '0 26px 80px -30px rgba(99, 102, 241, 0.55)',
        focus: '0 0 0 3px rgba(99, 102, 241, 0.35)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.65rem',
        '3xl': '2.25rem',
      },
      maxWidth: {
        'content-sm': '720px',
        'content-md': '960px',
        'content-lg': '1180px',
        'content-xl': '1320px',
      },
      spacing: {
        18: '4.5rem',
      },
      backdropBlur: {
        xs: '6px',
      },
      animation: {
        'pulse-soft': 'pulse 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
