/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── 브랜드 (Cool Blue / Cyan 계열) ───────────────────
        primary:   { DEFAULT: '#1A56DB', light: '#EBF5FF', dark: '#1139A6' },
        accent:    { DEFAULT: '#7C3AED', light: '#F3EFFE' },
        cyan:      { DEFAULT: '#0EA5E9', light: '#E0F2FE', dark: '#0284C7' },

        // ── 시그널 (한국 관례: 상승=빨강, 하락=파랑) ─────────
        bull:    { DEFAULT: '#E84040', light: '#FEF2F2' },
        bear:    { DEFAULT: '#2563EB', light: '#EFF6FF' },
        neutral: { DEFAULT: '#6B7280', light: '#F3F4F6' },

        // ── 위험도 (VIX 연동) ─────────────────────────────────
        danger:  { DEFAULT: '#DC2626', light: '#FEF2F2' },
        warn:    { DEFAULT: '#EA580C', light: '#FFF7ED' },
        safe:    { DEFAULT: '#16A34A', light: '#F0FDF4' },

        // ── 날씨 ──────────────────────────────────────────────
        sunny:         '#F59E0B',
        partly_cloudy: '#60A5FA',
        cloudy:        '#9CA3AF',
        rainy:         '#6366F1',
        thunderstorm:  '#EF4444',

        // ── 베이스 (Cool Blue 화이트 테마) ────────────────────
        surface:    '#FFFFFF',
        surface2:   '#F0F5FF',   // 블루 틴트 배경
        surface3:   '#E8EFFE',   // 더 진한 블루 틴트
        border:     'rgba(147, 197, 253, 0.5)',  // 블루 반투명 테두리
        borderDark: '#BFDBFE',
        text: {
          primary:   '#0F172A',
          secondary: '#1E3A5F',
          muted:     '#64748B',
          faint:     '#94A3B8',
        },
      },

      fontFamily: {
        sans: ['"Pretendard"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      boxShadow: {
        // 기존 카드 그림자
        card:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        cardHover: '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        ticker:    '0 1px 0 rgba(0,0,0,0.06)',

        // ── Cool Blue 글로우 효과 ─────────────────────────────
        'glow-blue': '0 0 16px rgba(26,86,219,0.22), 0 0 32px rgba(26,86,219,0.10), 0 2px 8px rgba(26,86,219,0.12)',
        'glow-cyan': '0 0 16px rgba(14,165,233,0.28), 0 0 32px rgba(14,165,233,0.12)',
        'glow-sm':   '0 0 8px rgba(26,86,219,0.20), 0 2px 4px rgba(26,86,219,0.10)',
        'glow-xs':   '0 0 6px rgba(14,165,233,0.40)',
        // 발광 노드 (데이터 포인트)
        'node-blue': '0 0 6px rgba(14,165,233,0.90), 0 0 14px rgba(14,165,233,0.50)',
        'node-cyan': '0 0 6px rgba(14,165,233,1.00), 0 0 18px rgba(14,165,233,0.60)',
        // 캡슐 컨테이너
        'capsule':   '0 0 0 1px rgba(147,197,253,0.35), 0 4px 20px rgba(26,86,219,0.08)',
        'capsule-hover': '0 0 0 1px rgba(96,165,250,0.55), 0 8px 28px rgba(26,86,219,0.15)',
        // 사이드바 로고
        'logo-glow': '0 0 20px rgba(14,165,233,0.40), 0 0 40px rgba(26,86,219,0.20)',
      },

      borderRadius: {
        card: '16px',
        pill: '9999px',
        capsule: '20px',
      },

      backgroundImage: {
        // 메인 그라데이션
        'blue-grad':  'linear-gradient(135deg, #1A56DB 0%, #0EA5E9 100%)',
        'blue-grad2': 'linear-gradient(160deg, #1139A6 0%, #1A56DB 50%, #0EA5E9 100%)',
        // 카드 배경 그라데이션
        'card-blue':  'linear-gradient(145deg, rgba(219,234,254,0.45) 0%, rgba(224,242,254,0.25) 100%)',
        'card-cyan':  'linear-gradient(145deg, rgba(224,242,254,0.60) 0%, rgba(219,234,254,0.30) 100%)',
        // 사이드바
        'sidebar-grad': 'linear-gradient(180deg, #0F172A 0%, #1E3A5F 60%, #1A56DB 100%)',
        // 글로우 오버레이
        'glow-overlay': 'radial-gradient(ellipse at top, rgba(14,165,233,0.08) 0%, transparent 70%)',
      },

      animation: {
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'fade-in':       'fade-in .2s ease-out',
        'slide-up':      'slide-up .25s ease-out',
        'pulse-bull':    'pulse-bull 1.5s ease-in-out infinite',
        'pulse-bear':    'pulse-bear 1.5s ease-in-out infinite',
        'gauge-fill':    'gauge-fill .8s ease-out forwards',
        // Cool Blue 전용 애니메이션
        'pulse-node':    'pulse-node 2s ease-in-out infinite',
        'glow-breathe':  'glow-breathe 3s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
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
        // 발광 노드 펄스
        'pulse-node': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(14,165,233,0.9), 0 0 14px rgba(14,165,233,0.5)', transform: 'scale(1)' },
          '50%':      { boxShadow: '0 0 10px rgba(14,165,233,1.0), 0 0 24px rgba(14,165,233,0.7)', transform: 'scale(1.2)' },
        },
        // 글로우 숨쉬기
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(26,86,219,0.20), 0 0 32px rgba(26,86,219,0.08)' },
          '50%':      { boxShadow: '0 0 24px rgba(26,86,219,0.35), 0 0 48px rgba(26,86,219,0.15)' },
        },
        // 시머 효과
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
