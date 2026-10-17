/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Accessible color palette with sufficient contrast ratios */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        /* High contrast mode colors */
        hc: {
          bg: '#000000',
          fg: '#ffffff',
          link: '#ffff00',
          focus: '#00ffff',
          border: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        /* Accessible font sizes – base ≥ 16px */
        'accessible-sm': ['1rem', { lineHeight: '1.5' }],
        'accessible-base': ['1.125rem', { lineHeight: '1.75' }],
        'accessible-lg': ['1.25rem', { lineHeight: '1.75' }],
        'accessible-xl': ['1.5rem', { lineHeight: '2' }],
      },
      spacing: {
        /* Minimum touch target size (44x44px per WCAG 2.5.5) */
        'touch': '2.75rem',
      },
      animation: {
        'focus-ring': 'focus-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'focus-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.5)' },
          '50%': { boxShadow: '0 0 0 5px rgba(37, 99, 235, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
