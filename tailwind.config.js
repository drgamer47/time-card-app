/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0072CE',
        accent: '#14B8A6',
        success: '#10B981',
        warning: '#F59E0B',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
      },
    },
  },
}

