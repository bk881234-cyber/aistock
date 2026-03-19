/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── 브랜드 컬러 ────────────────────────────────────
        primary:   { DEFAULT: '#1A56DB', light: '#EBF0FF', dark: '#1139A6' },
        accent:    { DEFAULT: '#7C3AED', light: '#F3EFFE' },

        // ── 시그널 컬러 ────────────────────────────────────
        bull:      { DEFAULT: '#0FA36E', light: '#E6F9F3' },  // 상승 (초록)
        bear:      { DEFAULT: '#E84040', light: '#FEE9E9' },  // 하락 (빨강)
        neutral:   { DEFAULT: '#6B7280', light: '#F3F4F6' },  // 보합 (회색)

        // ── 날씨 컬러 ──────────────────────────────────────
        sunny:         '#F59E0B',
        partly_cloudy: '#60A5FA',
        cloudy:        '#9CA3AF',
        rainy:         '#6366F1',
        thunderstorm:  '#EF4444',

        // ── 베이스 (화이트 테마) ───────────────────────────
        surface:   '#FFFFFF',
        surface2:  '#F8FAFC',
        border:    '#E5E7EB',
        borderDark:'#D1D5DB',
        text:      { primary: '#111827', secondary: '#6B7280', muted: '#9CA3AF' },
      },

      fontFamily: {
        sans: ['"Pretendard"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        'ticker': ['13px', { lineHeight: '1.4', fontWeight: '600' }],
      },

      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)',
        cardHover: '0 4px 12px 0 rgba(0,0,0,.10)',
        panel: '0 0 0 1px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.06)',
      },

      borderRadius: {
        card: '12px',
        pill: '9999px',
      },

      animation: {
        'ticker-scroll':  'ticker-scroll 30s linear infinite',
        'fade-in':        'fade-in .2s ease-out',
        'slide-up':       'slide-up .25s ease-out',
        'pulse-bull':     'pulse-bull 1.5s ease-in-out infinite',
        'pulse-bear':     'pulse-bear 1.5s ease-in-out infinite',
      },

      keyframes: {
        'ticker-scroll': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-bull': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(15, 163, 110, .4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(15, 163, 110, 0)' },
        },
        'pulse-bear': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 64, 64, .4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(232, 64, 64, 0)' },
        },
      },
    },
  },
  plugins: [],
};
