/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (Teal/Cyan)
        primary: {
          DEFAULT: '#0891B2', // Cyan-600
          light: '#06B6D4',   // Cyan-500
          dark: '#0E7490',    // Cyan-700
        },
        // Secondary palette (Emerald)
        secondary: {
          DEFAULT: '#059669', // Emerald-600
          light: '#10B981',   // Emerald-500
          dark: '#047857',    // Emerald-700
        },
        // Neutral palette
        background: '#0F172A', // Slate-900
        surface: '#1E293B',    // Slate-800
        card: '#334155',       // Slate-700
        border: '#475569',     // Slate-600
        muted: '#64748B',      // Slate-500
        // Text colors
        text: {
          primary: '#F8FAFC',   // Slate-50
          secondary: '#94A3B8', // Slate-400
          muted: '#64748B',     // Slate-500
        },
        // Semantic colors
        success: '#10B981',  // Emerald-500
        warning: '#F59E0B',  // Amber-500
        error: '#EF4444',    // Red-500
        info: '#06B6D4',     // Cyan-500
        // Legacy accent (for gradual migration)
        accent: '#06B6D4',   // Cyan-500
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.6' }],
        'xl': ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(8, 145, 178, 0.3)',
        'glow-strong': '0 0 30px rgba(8, 145, 178, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(8, 145, 178, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(8, 145, 178, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}