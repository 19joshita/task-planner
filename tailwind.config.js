/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        todo: "#e5e7eb", // gray-200
        inprogress: "#bfdbfe", // blue-200
        review: "#fde68a", // amber-200
        completed: "#bbf7d0", // green-200
      },
    },
  },

  plugins: [],
};
