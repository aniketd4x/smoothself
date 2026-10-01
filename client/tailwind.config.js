/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        }
      },
      fontFamily: {
        serif: ['Butler', 'Playfair Display', 'serif'],
        sans: ['Jost', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'drawer': '-10px 0 30px rgba(0,0,0,0.12)',
        'card': '0 4px 20px rgba(0,0,0,0.05)',
        'sticky': '0 2px 10px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
}
