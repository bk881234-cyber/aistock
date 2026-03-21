import { useState, useEffect, useCallback } from 'react';
import { getIndexChart } from '@/api/marketApi';
import { fmtIndex, fmtPct } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

const PERIODS = [
  { key: '1d',  label: '일' },
  { key: '5d',  label: '주' },
  { key: '1mo', label: '월' },
  { key: '1y',  label: '년' },
];

const LABELS = {
  KOSPI:  '코스피',
  KOSDAQ: '코스닥',
  NASDAQ: '나스닥',
  SPX:    'S&P 500',
};

export default function IndexChartCard({ data }) {
  const [period, setPeriod]   = useState('1d');
  const [chartData, setChart] = useState([]);
  const [chartLoading, setCL] = useState(false);

  const fetchChart = useCallback(async (sym, p) => {
    if (!sym) return;
    setCL(true);
    try {
      const d = await getIndexChart(sym, p);
      setChart(d?.sparkline ?? []);
    } catch {
      setChart([]);
    } finally {
      setCL(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(data?.symbol, period);
  }, [data?.symbol, period, fetchChart]);

  if (!data) return <SkeletonChartCard />;

  const { symbol, current_val, change_val, change_pct, raw_json } = data;
  const isUp        = change_pct > 0;
  const isDown      = change_pct < 0;
  const marketState = raw_json?.marketState;
  const chartColor  = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';

  // 방향에 따른 카드 글로우 색상
  const accentColor = isUp
    ? { border: 'rgba(232,64,64,0.35)', glow: 'rgba(232,64,64,0.10)', left: '#E84040' }
    : isDown
    ? { border: 'rgba(37,99,235,0.35)',  glow: 'rgba(37,99,235,0.10)',  left: '#2563EB' }
    : { border: 'rgba(147,197,253,0.35)', glow: 'rgba(26,86,219,0.05)', left: '#93C5FD' };

  return (
    <div
      className="relative overflow-hidden flex flex-col gap-3 transition-all duration-200"
      style={{
        borderRadius: '16px',
        padding: '20px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.85) 100%)',
        border: `1px solid ${accentColor.border}`,
        boxShadow: `0 2px 10px ${accentColor.glow}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 16px ${accentColor.glow}`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 2px 10px ${accentColor.glow}`;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* 발광 노드 */}
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
            background: accentColor.left,
            boxShadow: `0 0 6px ${accentColor.left}80`,
          }} />
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1E3A5F' }}>
            {LABELS[symbol] ?? symbol}
          </span>
          {marketState && (
            <span style={{
              fontSize: '10px', padding: '2px 6px', borderRadius: '6px', fontWeight: '600',
              background: marketState === 'REGULAR' ? 'rgba(22,163,74,0.10)' : 'rgba(147,197,253,0.20)',
              color: marketState === 'REGULAR' ? '#16A34A' : '#64748B',
              border: `1px solid ${marketState === 'REGULAR' ? 'rgba(22,163,74,0.20)' : 'rgba(147,197,253,0.30)'}`,
            }}>
              {marketState === 'REGULAR' ? '장중' : '장외'}
            </span>
          )}
        </div>

        {/* 기간 탭 — 항상 아래 행 */}
        <div className="flex rounded-lg p-0.5 gap-0.5 w-full" style={{
          background: 'rgba(219,234,254,0.50)',
          border: '1px solid rgba(147,197,253,0.30)',
        }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="flex-1"
              style={{
                padding: '3px 0', fontSize: '11px', fontWeight: '600',
                borderRadius: '6px', transition: 'all 0.15s',
                background: period === p.key
                  ? 'linear-gradient(135deg, #1A56DB, #0EA5E9)'
                  : 'transparent',
                color: period === p.key ? '#fff' : '#64748B',
                boxShadow: period === p.key ? '0 2px 6px rgba(26,86,219,0.25)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 수치 + 발광 노드 */}
      <div>
        <p style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'monospace', color: '#0F172A', lineHeight: 1, letterSpacing: '-0.5px' }}>
          {fmtIndex(current_val)}
        </p>
        <div className="flex items-center gap-1 mt-1.5" style={{
          fontSize: '15px', fontWeight: '700',
          color: isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280',
        }}>
          <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmtIndex(Math.abs(change_val))}</span>
          <span style={{ opacity: 0.75 }}>({fmtPct(change_pct)})</span>
        </div>
      </div>

      {/* 차트 */}
      <div style={{ height: '72px', opacity: chartLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
        {chartData.length > 1 ? (
          <SparkLine data={chartData} width={300} height={72} color={chartColor} filled responsive />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              {chartLoading ? '로딩 중...' : '데이터 없음'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonChartCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 rounded-full" style={{ background: 'rgba(147,197,253,0.30)' }} />
        <div className="h-6 w-28 rounded-lg" style={{ background: 'rgba(147,197,253,0.30)' }} />
      </div>
      <div className="h-8 w-32 rounded" style={{ background: 'rgba(147,197,253,0.25)' }} />
      <div className="h-4 w-24 rounded" style={{ background: 'rgba(147,197,253,0.20)' }} />
      <div className="h-[72px] rounded-lg" style={{ background: 'rgba(147,197,253,0.20)' }} />
    </div>
  );
}
