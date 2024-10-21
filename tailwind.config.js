/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./<custom directory>/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-color": "#2D9CDB",
        "secondary-color": "#56CCF2",
        // "tertiary-color": "#27AE60",
        "primary-text-color": "#333333",
        "secondary-text-color": "#828282",
        "light-text-color": "#ffffff",
        "background-color": "#F2F4F7",
        "warning-color": "#EB5757",
        "success-color": "#27AE60",
      },
    },
  },
  plugins: [],
};
