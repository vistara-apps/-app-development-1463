/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 100%, 50%)',
        accent: 'hsl(130, 70%, 45%)',
        surface: 'hsl(210, 35%, 100%)',
        bg: 'hsl(210, 35%, 95%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px', 
        'lg': '12px',
      },
      spacing: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}