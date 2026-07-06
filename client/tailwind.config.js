/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── 브랜드 (Minimalist Charcoal & Jet Black 계열) ───────
        primary:   { DEFAULT: '#1E293B', light: '#F1F5F9', dark: '#0F172A' },
        accent:    { DEFAULT: '#475569', light: '#F8FAFC' },
        cyan:      { DEFAULT: '#64748B', light: '#F8FAFC', dark: '#475569' },

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
        partly_cloudy: '#94A3B8',
        cloudy:        '#9CA3AF',
        rainy:         '#6366F1',
        thunderstorm:  '#EF4444',

        // ── 베이스 (Charcoal / Slate 화이트 테마) ───────────────
        surface:    '#FFFFFF',
        surface2:   '#F8FAFC',   // 웜 슬레이트 그레이 연한 배경
        surface3:   '#F1F5F9',   // 더 진한 슬레이트 배경
        border:     'rgba(148, 163, 184, 0.15)',  // 슬레이트 반투명 테두리
        borderDark: '#CBD5E1',
        text: {
          primary:   '#0F172A',
          secondary: '#334155',
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
        cardHover: '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
        ticker:    '0 1px 0 rgba(0,0,0,0.06)',

        // ── Minimalist 섀도우 효과 (형광 글로우 제거) ────────────
        'glow-blue': '0 4px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
        'glow-cyan': '0 2px 8px rgba(15,23,42,0.04)',
        'glow-sm':   '0 2px 6px rgba(15,23,42,0.03)',
        'glow-xs':   '0 1px 3px rgba(15,23,42,0.02)',
        // 발광 대신 미니멀 서클 보더
        'node-blue': '0 0 0 2px rgba(148,163,184,0.20)',
        'node-cyan': '0 0 0 2px rgba(148,163,184,0.30)',
        // 캡슐 컨테이너
        'capsule':   '0 0 0 1px rgba(226,232,240,0.8), 0 2px 8px rgba(15,23,42,0.04)',
        'capsule-hover': '0 0 0 1px rgba(203,213,225,1), 0 4px 16px rgba(15,23,42,0.08)',
        // 사이드바 로고
        'logo-glow': 'none',
      },

      borderRadius: {
        card: '16px',
        pill: '9999px',
        capsule: '20px',
      },

      backgroundImage: {
        // 메인 그라데이션 (차콜/블랙)
        'blue-grad':  'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        'blue-grad2': 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #475569 100%)',
        // 카드 배경 그라데이션
        'card-blue':  'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.85) 100%)',
        'card-cyan':  'linear-gradient(145deg, rgba(248,250,252,1) 0%, rgba(241,245,249,0.80) 100%)',
        // 사이드바 (차콜 & 제트 블랙 밤하늘)
        'sidebar-grad': 'linear-gradient(180deg, #09090B 0%, #18181B 60%, #27272A 100%)',
        // 글로우 오버레이 제거
        'glow-overlay': 'none',
      },

      animation: {
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'fade-in':       'fade-in .2s ease-out',
        'slide-up':      'slide-up .25s ease-out',
        'pulse-bull':    'pulse-bull 1.5s ease-in-out infinite',
        'pulse-bear':    'pulse-bear 1.5s ease-in-out infinite',
        'gauge-fill':    'gauge-fill .8s ease-out forwards',
        // Minimalist 전용 애니메이션 (불투명도 펄스)
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
        // 발광 대신 투명도 펄스
        'pulse-node': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':      { opacity: '1.0', transform: 'scale(1.15)' },
        },
        // 글로우 숨쉬기 대신 그림자 숨쉬기
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' },
          '50%':      { boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)' },
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
