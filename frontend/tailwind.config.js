/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3f4f6',   // ash grey tint
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',   // cement grey
          400: '#6b7280',
          500: '#4b5563',   // slate grey
          600: '#374151',   // concrete grey (primary accent)
          700: '#1f2937',
          800: '#111827',   // dark graphite
          900: '#030712',
        },
        earth: {
          50:  '#f8fafc',   // light mineral slate
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',   // slate border grey
          400: '#94a3b8',
          500: '#64748b',   // steel grey
          600: '#475569',
          700: '#334155',
          800: '#1e293b',   // graphite slate
          900: '#0f172a',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'count-up': 'count-up 2s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'count-up': { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
