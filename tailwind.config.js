/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#0A0A14',
          subtle: '#0E0E1C',
          surface: '#141426',
          elevated: '#1C1C36',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.15)'
        },
        plasma: {
          DEFAULT: '#7B61FF',
          glow: 'rgba(123, 97, 255, 0.35)',
          light: '#9B87FF',
          dark: '#583EE0'
        },
        lime: {
          DEFAULT: '#E4F900',
          glow: 'rgba(228, 249, 0, 0.3)',
          dim: '#B0C200'
        },
        cyan: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.3)'
        },
        ghost: '#F0EFF4',
        graphite: '#18181B',
        emerald: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)'
        },
        rose: {
          DEFAULT: '#F43F5E',
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)'
        },
        amber: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)'
        }
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        drama: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        '2rem': '2rem',
        '2.5rem': '2.5rem',
        '3rem': '3rem',
        '4rem': '4rem',
      },
      boxShadow: {
        'glass': '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'plasma-glow': '0 0 30px rgba(123, 97, 255, 0.35)',
        'lime-glow': '0 0 25px rgba(228, 249, 0, 0.3)',
      },
      animation: {
        'pulse-beacon': 'pulseBeacon 2s ease-in-out infinite',
        'subtle-drift': 'subtleDrift 40s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseBeacon: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        subtleDrift: {
          '0%': { transform: 'scale(1.02) translate(0, 0)' },
          '50%': { transform: 'scale(1.06) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1.03) translate(1%, 0.5%)' },
        }
      }
    },
  },
  plugins: [],
}
