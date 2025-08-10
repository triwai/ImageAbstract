import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        holo: {
          100: '#E4F1FF',
          200: '#CDE7FF',
          300: '#B3DBFF',
          400: '#9ED0FF',
          500: '#89C5FF',
          600: '#73B9FF',
        },
      },
      backgroundImage: {
        'holo-gradient': 'conic-gradient(from 180deg at 50% 50%, #FFDEE9, #B5FFFC, #C2FFD8, #FBD3E9, #E2B0FF, #FFDEE9)'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.15), inset 0 0 80px rgba(255,255,255,0.15)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
export default config
