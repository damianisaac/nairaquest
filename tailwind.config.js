/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        naira: {
          green: '#008751',
          'green-dark': '#005c38',
          'green-light': '#00b86a',
          gold: '#d4af37',
          'gold-light': '#f0d060',
          white: '#f5f5f0',
        },
        zone: {
          money: '#22c55e',
          banking: '#3b82f6',
          budgeting: '#f59e0b',
          savings: '#8b5cf6',
          scams: '#ef4444',
          loans: '#f97316',
          economy: '#06b6d4',
          entrepreneur: '#ec4899',
          insurance: '#14b8a6',
        },
      },
      fontFamily: {
        display: ['Righteous', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'coin-spin': 'coinSpin 1s ease-in-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        coinSpin: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.2)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,135,81,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0,135,81,0.8), 0 0 60px rgba(212,175,55,0.3)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'naira-gradient': 'linear-gradient(135deg, #005c38 0%, #008751 50%, #00b86a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #b8941f 100%)',
      },
    },
  },
  plugins: [],
}
