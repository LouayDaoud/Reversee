/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées pour le thème clair
        'light-bg': '#ffffff',
        'light-text': '#1f2937',
        'light-primary': '#6366f1', // Indigo-500
        'light-secondary': '#f3f4f6', // Gray-100
        'light-accent': '#8b5cf6', // Violet-500
        'light-card': '#ffffff',
        'light-border': '#e5e7eb', // Gray-200

        // Couleurs personnalisées pour le thème sombre
        'dark-bg': '#1f2937', // Gray-800
        'dark-text': '#f9fafb', // Gray-50
        'dark-primary': '#818cf8', // Indigo-400
        'dark-secondary': '#374151', // Gray-700
        'dark-accent': '#a78bfa', // Violet-400
        'dark-card': '#111827', // Gray-900
        'dark-border': '#4b5563', // Gray-600
      },
    },
  },
  plugins: [
    function({ addBase, addComponents, theme }) {
      addBase({
        // Thème clair (par défaut)
        ':root': {
          '--color-bg': theme('colors.light-bg'),
          '--color-text': theme('colors.light-text'),
          '--color-primary': theme('colors.light-primary'),
          '--color-secondary': theme('colors.light-secondary'),
          '--color-accent': theme('colors.light-accent'),
          '--color-card': theme('colors.light-card'),
          '--color-border': theme('colors.light-border'),
        },
        // Thème sombre
        '[data-theme="dark"]': {
          '--color-bg': theme('colors.dark-bg'),
          '--color-text': theme('colors.dark-text'),
          '--color-primary': theme('colors.dark-primary'),
          '--color-secondary': theme('colors.dark-secondary'),
          '--color-accent': theme('colors.dark-accent'),
          '--color-card': theme('colors.dark-card'),
          '--color-border': theme('colors.dark-border'),
        },
      });

      // Classes personnalisées pour les thèmes
      addComponents({
        '.bg-theme': {
          backgroundColor: 'var(--color-bg)',
        },
        '.text-theme': {
          color: 'var(--color-text)',
        },
        '.bg-theme-card': {
          backgroundColor: 'var(--color-card)',
        },
        '.border-theme': {
          borderColor: 'var(--color-border)',
        },
        '.bg-theme-secondary': {
          backgroundColor: 'var(--color-secondary)',
        },
      });
    },
  ],
}