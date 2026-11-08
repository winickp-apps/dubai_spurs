/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spurs: {
          navy: '#132257',
          light: '#1a2f70',
          gold: '#c8a84b',
        },
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

