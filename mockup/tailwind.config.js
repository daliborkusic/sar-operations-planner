/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hgss: {
          red: '#C41E3A',
          blue: '#1E3A5F',
          gold: '#D4A843',
        },
      },
    },
  },
  plugins: [],
};

