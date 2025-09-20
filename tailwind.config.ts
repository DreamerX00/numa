import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E7654D',
          dark: '#C44F3A',
          accent: '#F4D5CC'
        },
        base: {
          bg: '#FAF9F7',
          ink: '#1E1B18',
          muted: '#6B625B',
          border: '#E7E2DC'
        },
        state: {
          success: '#2E7D4F',
          error: '#B3261E',
          warn: '#C67C00',
          info: '#286F9F'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular']
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.04)',
        card: '0 2px 4px -2px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04)',
        elevated: '0 4px 10px -2px rgba(0,0,0,0.12), 0 6px 20px -4px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        pill: '9999px'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } }
      },
      animation: {
        fadeIn: 'fadeIn .4s ease',
        scaleIn: 'scaleIn .25s ease'
      }
    }
  },
  plugins: []
}
export default config
