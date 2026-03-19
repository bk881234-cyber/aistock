/**
 * 숫자 → 통화 형식 (한국 원)
 * @example fmtKRW(1234567) → "1,234,567원"
 */
export const fmtKRW = (value, showSign = false) => {
  if (value == null || isNaN(value)) return '—';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('ko-KR');
  if (showSign) return `${value >= 0 ? '+' : '-'}${formatted}원`;
  return `${formatted}원`;
};

/**
 * 숫자 → USD 형식
 */
export const fmtUSD = (value) => {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

/**
 * 등락률 포맷 (+2.34% / -1.20%)
 */
export const fmtPct = (value, digits = 2) => {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(digits)}%`;
};

/**
 * 큰 숫자 축약 (1,234,567 → 123.5만)
 */
export const fmtCompact = (value) => {
  if (value == null || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}십억`;
  if (abs >= 100_000_000)   return `${(value / 100_000_000).toFixed(1)}억`;
  if (abs >= 10_000)        return `${(value / 10_000).toFixed(1)}만`;
  return value.toLocaleString('ko-KR');
};

/**
 * 지수값 포맷 (소수점 자릿수 자동 조정)
 */
export const fmtIndex = (value) => {
  if (value == null || isNaN(value)) return '—';
  const num = Number(value);
  if (num > 100) return num.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  return num.toFixed(4);
};

/**
 * 날짜 → "MM/DD HH:mm" 형식
 */
export const fmtDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
};

/**
 * 등락 방향 판별
 */
export const getDirection = (value) => {
  if (value > 0)  return 'bull';
  if (value < 0)  return 'bear';
  return 'flat';
};

/**
 * Tailwind 색상 클래스 반환
 */
export const directionClass = (value, type = 'text') => {
  const dir = getDirection(value);
  const map = {
    text: { bull: 'text-bull', bear: 'text-bear', flat: 'text-neutral' },
    bg:   { bull: 'bg-bull-light', bear: 'bg-bear-light', flat: 'bg-neutral-light' },
    border: { bull: 'border-bull', bear: 'border-bear', flat: 'border-neutral' },
  };
  return map[type][dir];
};
