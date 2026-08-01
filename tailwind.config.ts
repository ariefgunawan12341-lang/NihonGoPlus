import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)'
        },
        line: 'rgb(var(--color-line) / <alpha-value>)',
        blue: {
          50: '#EEF3FE',
          100: '#DCE7FD',
          400: '#7FA4F3',
          500: '#5B8DEF',
          600: '#4472D6',
          700: '#345BB0'
        },
        mint: {
          50: '#EAFBF6',
          100: '#D0F5EA',
          400: '#6FDFC0',
          500: '#4FD1AE',
          600: '#38B393'
        },
        hanko: {
          DEFAULT: '#C8432A',
          dark: '#A6331E'
        },
        gold: {
          50: '#FBF4E4',
          400: '#E8C170',
          500: '#D4A94A',
          600: '#B4872F'
        }
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        jp: ['"Zen Maru Gothic"', '"Inter"', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        soft: '0 2px 10px rgba(31, 42, 55, 0.06)',
        card: '0 4px 20px rgba(31, 42, 55, 0.08)'
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        stamp: {
          '0%': { transform: 'scale(1.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(-8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-8deg)', opacity: '1' }
        }
      },
      animation: {
        popIn: 'popIn 0.18s ease-out',
        stamp: 'stamp 0.35s cubic-bezier(0.2,0.8,0.3,1.2)'
      }
    }
  },
  plugins: []
} satisfies Config
