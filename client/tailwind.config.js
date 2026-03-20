/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── 브랜드 ────────────────────────────────────────
        primary:   { DEFAULT: '#1A56DB', light: '#EBF0FF', dark: '#1139A6' },
        accent:    { DEFAULT: '#7C3AED', light: '#F3EFFE' },

        // ── 시그널 (한국 관례: 상승=빨강, 하락=파랑) ─────
        bull:    { DEFAULT: '#E84040', light: '#FEF2F2' },
        bear:    { DEFAULT: '#2563EB', light: '#EFF6FF' },
        neutral: { DEFAULT: '#6B7280', light: '#F3F4F6' },

        // ── 위험도 (VIX 연동) ─────────────────────────────
        danger:  { DEFAULT: '#DC2626', light: '#FEF2F2' },  // VIX 30+
        warn:    { DEFAULT: '#EA580C', light: '#FFF7ED' },  // VIX 20-30
        safe:    { DEFAULT: '#16A34A', light: '#F0FDF4' },  // VIX <20

        // ── 날씨 ──────────────────────────────────────────
        sunny:         '#F59E0B',
        partly_cloudy: '#60A5FA',
        cloudy:        '#9CA3AF',
        rainy:         '#6366F1',
        thunderstorm:  '#EF4444',

        // ── 베이스 (화이트 테마) ──────────────────────────
        surface:    '#FFFFFF',
        surface2:   '#F9FAFB',
        surface3:   '#F3F4F6',
        border:     '#E5E7EB',
        borderDark: '#D1D5DB',
        text: {
          primary:   '#111827',
          secondary: '#374151',
          muted:     '#6B7280',
          faint:     '#9CA3AF',
        },
      },

      fontFamily: {
        sans: ['"Pretendard"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        cardHover: '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        ticker:    '0 1px 0 rgba(0,0,0,0.06)',
        focus:     '0 0 0 3px rgba(26,86,219,0.15)',
        inner:     'inset 0 1px 3px rgba(0,0,0,0.06)',
      },

      borderRadius: {
        card: '12px',
        pill: '9999px',
      },

      animation: {
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'fade-in':       'fade-in .2s ease-out',
        'slide-up':      'slide-up .25s ease-out',
        'pulse-bull':    'pulse-bull 1.5s ease-in-out infinite',
        'pulse-bear':    'pulse-bear 1.5s ease-in-out infinite',
        'gauge-fill':    'gauge-fill .8s ease-out forwards',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,64,64,.35)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(232,64,64,0)' },
        },
        'pulse-bear': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37,99,235,.35)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(37,99,235,0)' },
        },
      },
    },
  },
  plugins: [],
};
