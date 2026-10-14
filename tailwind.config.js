/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#000000',
          hover: '#262626',
          accent: '#525252',
          sale: '#000000',
          bg: '#ffffff',
          surface: '#f5f5f5',
          border: '#e5e5e5',
          text: '#000000',
          muted: '#737373'
        },
        admin: {
          primary: '#000000',
          hover: '#262626',
          bg: '#ffffff',
          surface: '#f5f5f5',
          border: '#e5e5e5',
          text: '#000000',
          muted: '#737373'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        admin: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'drawer': '-10px 0 30px rgba(0,0,0,0.12)',
        'card': '0 4px 20px rgba(0,0,0,0.05)',
        'sticky': '0 2px 10px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
};
