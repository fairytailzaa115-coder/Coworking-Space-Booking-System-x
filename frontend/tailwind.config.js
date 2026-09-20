/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          450: '#10b981',
          550: '#059669',
        },
        forest: {
          950: '#03120E',
          900: '#062019',
          850: '#0B2B23',
          800: '#0F382E',
          700: '#144F41',
        },
        techgreen: {
          glow: '#00FF9D',
          neon: '#10B981',
          accent: '#34D399',
          dark: '#021F17',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'green-mesh': 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)',
      }
    },
  },
  plugins: [],
};
