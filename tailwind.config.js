/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta myfinlife - Design System
        'myfinlife': {
          'blue': '#1A3F6B',      // Azul escuro principal
          'blue-light': '#B3DFFA', // Azul claro
          'gray-light': '#F5F7FA', // Cinza claro
          'white': '#FFFFFF',     // Branco
        },
        // Cores do sistema (mantendo compatibilidade)
        primary: {
          50: '#F5F7FA',
          100: '#B3DFFA',
          200: '#B3DFFA',
          300: '#7BB3F0',
          400: '#4A8FE7',
          500: '#1A3F6B',
          600: '#16355A',
          700: '#122B49',
          800: '#0E2138',
          900: '#0A1727',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'hex': '12px', // Para elementos hexagonais
      },
      boxShadow: {
        'myfinlife': '0 4px 6px -1px rgba(26, 63, 107, 0.1), 0 2px 4px -1px rgba(26, 63, 107, 0.06)',
        'myfinlife-lg': '0 10px 15px -3px rgba(26, 63, 107, 0.1), 0 4px 6px -2px rgba(26, 63, 107, 0.05)',
      },
    },
  },
  plugins: [],
}

