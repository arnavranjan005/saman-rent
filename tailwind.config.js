/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './screens/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5B2DF0',
        ink: '#1A1A2E',
        muted: '#8A8A9E',
        mist: '#F4F3FB',
        leaf: '#16A34A',
        amber: '#F59E0B',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
};
