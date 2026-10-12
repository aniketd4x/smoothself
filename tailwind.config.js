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
          primary: '#332d55',
          hover: '#282344',
          accent: '#9a84c8',
          sale: '#da3f3f',
          bg: '#ffffff',
          surface: '#f5f5f5',
          border: '#eeeeee',
          text: '#212121',
          muted: '#666666'
        },
        admin: {
          primary: '#111111',
          hover: '#262626',
          bg: '#ffffff',
          surface: '#f5f5f5',
          border: '#e5e5e5',
          text: '#111111',
          muted: '#6b7280'
        }
      },
      fontFamily: {
        serif: ['Butler', 'Playfair Display', 'serif'],
        sans: ['Jost', 'Inter', 'sans-serif'],
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
