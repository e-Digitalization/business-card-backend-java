/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        km: {
          ink: '#1a3d42',
          lagoon: '#0d7377',
          sea: '#14919b',
          foam: '#e7f5f4',
          mist: '#6d8a8d',
          sand: '#f6efe4',
          bone: '#faf6ef',
          paper: '#fbf8f3',
          copper: '#d4783a',
          ember: '#e8913a',
          coral: '#e06b4d',
          night: '#0d7377',
          slate: '#1f5559',
          teal: '#0d7377'
        },
        glass: 'rgba(255,255,255,0.12)',
        sdtBlue: '#2563eb',
        sdtOrange: '#f97316',
        sdtGreen: '#22c55e',
        sdtDark: '#0b0f1a'
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Georgia', 'serif'],
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 50px rgba(124,58,237,0.35)',
        soft: '0 24px 60px rgba(13, 115, 119, 0.12)'
      },
      backdropBlur: {
        xl: '24px'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.9s ease-out both',
        'fade-up-delay': 'fade-up 0.9s ease-out 0.15s both',
        'fade-up-delay-2': 'fade-up 0.9s ease-out 0.3s both',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite'
      }
    }
  },
  plugins: []
};
