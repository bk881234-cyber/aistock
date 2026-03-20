import { fmtIndex, fmtPct } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';

const LABELS = {
  USD_KRW: { name: 'USD / KRW', flag: '🇺🇸', accent: '#1A56DB' },
  EUR_KRW: { name: 'EUR / KRW', flag: '🇪🇺', accent: '#7C3AED' },
  JPY_KRW: { name: 'JPY / KRW', flag: '🇯🇵', accent: '#0EA5E9' },
};

export default function FxCard({ data, compact = false }) {
  if (!data) return <SkeletonFx compact={compact} />;

  const { symbol, raw_json } = data;
  const current_val = Number(data.current_val) || 0;
  const change_pct  = Number(data.change_pct)  || 0;
  const change_val  = Number(data.change_val)  || 0;
  const sparkline   = raw_json?.sparkline ?? [];
  const isUp        = change_pct > 0;
  const isDown      = change_pct < 0;
  const chartColor  = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';
  const meta        = LABELS[symbol] ?? { name: symbol, flag: '', accent: '#1A56DB' };

  const displayVal = symbol === 'JPY_KRW'
    ? current_val.toFixed(2)
    : fmtIndex(current_val);

  const dirColor = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';

  if (compact) {
    return (
      <div
        className="transition-all duration-200"
        style={{
          borderRadius: '16px',
          padding: '16px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.80) 100%)',
          border: '1px solid rgba(147,197,253,0.28)',
          boxShadow: '0 2px 8px rgba(26,86,219,0.05)',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,219,0.10)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,86,219,0.05)';
          e.currentTarget.style.transform = '';
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-1.5 mb-1">
          {/* 사이안 발광 노드 */}
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: meta.accent,
            boxShadow: `0 0 5px ${meta.accent}90`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: meta.accent }}>{meta.name}</span>
        </div>
        <p style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', color: '#0F172A', letterSpacing: '-0.5px' }}>
          {displayVal}
        </p>
        <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: dirColor }}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
      </div>
    );
  }

  // 풀 카드: 스파크라인
  return (
    <div
      className="transition-all duration-200"
      style={{
        borderRadius: '16px',
        padding: '16px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.80) 100%)',
        border: '1px solid rgba(147,197,253,0.35)',
        boxShadow: '0 0 0 1px rgba(147,197,253,0.18), 0 4px 20px rgba(26,86,219,0.07)',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '16px' }}>{meta.flag}</span>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1E3A5F' }}>{meta.name}</p>
        </div>
        <span style={{
          fontSize: '13px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px',
          background: isUp ? 'rgba(232,64,64,0.08)' : isDown ? 'rgba(37,99,235,0.08)' : 'rgba(107,114,128,0.08)',
          border: `1px solid ${isUp ? 'rgba(232,64,64,0.20)' : isDown ? 'rgba(37,99,235,0.20)' : 'rgba(107,114,128,0.20)'}`,
          color: dirColor,
        }}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </span>
      </div>

      {/* 수치 + 스파크라인 */}
      <div className="flex items-end gap-3">
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'monospace', color: '#0F172A', lineHeight: 1 }}>
            {displayVal}
          </p>
          <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px', color: dirColor }}>
            {isUp ? '+' : ''}{symbol === 'JPY_KRW' ? change_val.toFixed(3) : fmtIndex(change_val)}
          </p>
        </div>
        {sparkline.length > 1 && (
          <div style={{ flex: 1, height: '48px' }}>
            <SparkLine data={sparkline} width={120} height={48} color={chartColor} filled responsive />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonFx({ compact }) {
  return (
    <div className="animate-pulse" style={{
      borderRadius: '16px', padding: compact ? '16px' : '16px',
      background: 'rgba(219,234,254,0.30)',
      border: '1px solid rgba(147,197,253,0.25)',
    }}>
      <div style={{ height: '12px', width: '64px', borderRadius: '6px', background: 'rgba(147,197,253,0.30)', marginBottom: '8px' }} />
      <div style={{ height: '28px', width: '96px', borderRadius: '6px', background: 'rgba(147,197,253,0.25)', marginBottom: '6px' }} />
      <div style={{ height: '12px', width: '48px', borderRadius: '6px', background: 'rgba(147,197,253,0.20)' }} />
    </div>
  );
}
