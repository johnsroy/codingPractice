import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Mentora design tokens (premium & warm) ──────────────────────────
      colors: {
        // Primary: warm indigo
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent: warm amber / marigold
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Secondary: teal
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        // Tertiary warm: rose/coral for human warmth
        coral: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Warm near-white surfaces (cream, not cold grey)
        surface: {
          50:  '#fbfaf8',
          100: '#f6f4f0',
          200: '#ece8e1',
          300: '#ddd7cc',
        },
        // Deep warm ink for text
        ink: {
          700: '#3f3a52',
          800: '#2a2640',
          900: '#1a1730',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        xs:   ['0.8125rem',  { lineHeight: '1.25rem' }],
        sm:   ['0.9375rem',  { lineHeight: '1.5rem'  }],
        base: ['1.0625rem',  { lineHeight: '1.7rem' }],
        lg:   ['1.1875rem',  { lineHeight: '1.85rem' }],
        xl:   ['1.4rem',     { lineHeight: '1.9rem'  }],
        '2xl':['1.7rem',     { lineHeight: '2.15rem' }],
        '3xl':['2.1rem',     { lineHeight: '2.4rem'  }],
        '4xl':['2.7rem',     { lineHeight: '2.9rem', letterSpacing: '-0.02em' }],
        '5xl':['3.4rem',     { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],
        '6xl':['4.3rem',     { lineHeight: '4.3rem', letterSpacing: '-0.03em' }],
        '7xl':['5.4rem',     { lineHeight: '5.2rem', letterSpacing: '-0.035em' }],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        sm:  '0.5rem',
        md:  '0.75rem',
        lg:  '1rem',
        xl:  '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        full:'9999px',
      },
      boxShadow: {
        soft:   '0 2px 10px -2px rgba(26,23,48,0.06), 0 4px 20px -4px rgba(26,23,48,0.05)',
        card:   '0 4px 16px -4px rgba(26,23,48,0.08), 0 12px 40px -12px rgba(26,23,48,0.10)',
        lift:   '0 12px 32px -8px rgba(26,23,48,0.14), 0 24px 64px -16px rgba(99,102,241,0.12)',
        glow:   '0 8px 30px -6px rgba(99,102,241,0.35)',
        'glow-amber': '0 8px 30px -6px rgba(245,158,11,0.35)',
        modal:  '0 24px 70px -12px rgba(26,23,48,0.30)',
        ring:   '0 0 0 1px rgba(26,23,48,0.05)',
      },
      spacing: { 18: '4.5rem', 22: '5.5rem', 30: '7.5rem' },
      backgroundImage: {
        'mesh-warm':
          'radial-gradient(60% 60% at 15% 15%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(50% 50% at 85% 20%, rgba(20,184,166,0.16) 0%, transparent 55%), radial-gradient(60% 70% at 75% 90%, rgba(245,158,11,0.16) 0%, transparent 55%), radial-gradient(50% 50% at 20% 85%, rgba(244,63,94,0.10) 0%, transparent 55%)',
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 45%, #0d9488 100%)',
        'amber-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out both',
        'fade-up':  'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up': 'fadeUp 0.3s ease-out both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        float:      'float 7s ease-in-out infinite',
        'float-slow':'float 11s ease-in-out infinite',
        shimmer:    'shimmer 2.5s linear infinite',
        'spin-slow':'spin 18s linear infinite',
        'spin-slow-rev':'spinRev 24s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        spinRev: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(-360deg)' } },
      },
    },
  },
  plugins: [],
};

export default config;
