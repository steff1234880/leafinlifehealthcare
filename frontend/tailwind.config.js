/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Outfit"', 'sans-serif'],
        body: ['"Work Sans"', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#586c38',
          lightGreen: '#729855',
          darkGreen: '#2f3e10',
          cream: '#f9f9eb',
          heroCream: '#fef9ea',
          brown: '#796346',
          mint: '#64bf99',
          borderPeach: '#f7e9e3',
          overlayGray: '#e4ece6',
          bgGray: '#f5f5f5',
          gold: '#ffd700',
        },
      },
    },
  },
  plugins: [],
};

