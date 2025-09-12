import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // School colors namespace
        school: {
          // Primary colors
          primary: {
            nyanza: '#FFFFFC',        // Primary nyanza 
            blue: '#0b1320',       // Primary Blue
            white: '#FFFFFF',      // White
            black: '#000000',      // Black
            paledogwood: '#C9B7AD',  // Pale Dogwood
						darkpurple: '#22031F', // Dark Purple
						pink: '#CC76A1',      // Pink
						puce: '#DD9296',      // Puce
          },
        },
      },
      fontFamily: {
        // Brand guidelines fonts
        garamond: ['Didact Gothic', 'serif'],  // Primary font
      },
    },
  },
  plugins: [
    
  ],
}

export default config