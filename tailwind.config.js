/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,html}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2a37',
        graphite: '#3d4451',
        bone: '#f4f1ec',
        kiln: '#c4622d',
        moss: '#4b7a5b',
        rust: '#a63d2f',
        white: '#ffffff',
        border: 'rgba(31, 42, 55, 0.12)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(25, 31, 38, 0.12)',
        card: '0 10px 30px rgba(31, 42, 55, 0.08)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
