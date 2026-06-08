import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mentora design tokens
      colors: {
        // Primary: warm indigo
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // primary brand
          600: '#4f46e5',  // primary hover
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Accent: amber
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // accent
          600: '#d97706',
          700: '#b45309',
        },
        // Teal secondary
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
        // Near-white background
        surface: {
          50:  '#fafaf9',  // page background
          100: '#f5f5f4',
          200: '#e7e5e4',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Scaled up for accessibility
        xs:   ['0.8125rem',  { lineHeight: '1.25rem' }],
        sm:   ['0.9375rem',  { lineHeight: '1.5rem'  }],
        base: ['1.125rem',   { lineHeight: '1.75rem' }], // 18px base
        lg:   ['1.25rem',    { lineHeight: '1.875rem' }],
        xl:   ['1.5rem',     { lineHeight: '2rem'    }],
        '2xl':['1.75rem',    { lineHeight: '2.25rem' }],
        '3xl':['2rem',       { lineHeight: '2.5rem'  }],
        '4xl':['2.5rem',     { lineHeight: '3rem'    }],
        '5xl':['3rem',       { lineHeight: '3.5rem'  }],
      },
      borderRadius: {
        DEFAULT: '0.625rem',
        sm:  '0.375rem',
        md:  '0.625rem',
        lg:  '0.875rem',
        xl:  '1.125rem',
        '2xl': '1.5rem',
        full:'9999px',
      },
      boxShadow: {
        soft:   '0 2px 12px 0 rgba(0,0,0,0.06)',
        card:   '0 4px 20px 0 rgba(0,0,0,0.08)',
        hover:  '0 8px 30px 0 rgba(99,102,241,0.18)',
        modal:  '0 20px 60px 0 rgba(0,0,0,0.15)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'spin-slow':'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
