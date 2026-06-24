import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable class based dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(220, 90%, 55%)', // vibrant blue
          light: 'hsl(220, 90%, 65%)',
          dark: 'hsl(220, 90%, 45%)',
        },
        accent: {
          DEFAULT: 'hsl(340, 80%, 55%)', // vivid pink
        },
        background: {
          light: '#f5f7ff',
          dark: '#0a0a0a',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 10px rgba(255,255,255,0.2)',
      },
    },
  },
  plugins: [forms, typography],
};
