import { forwardRef } from 'react';
import { fmtKRW, fmtPct } from '@/utils/formatters';
import { WEATHER_META } from '@/hooks/useWeather';
import clsx from 'clsx';

/**
 * SNS 공유용 세로형 카드 (9:16 비율 = 1080×1920 → 360×640 미리보기)
 *
 * variant:
 *  'portfolio' — 포트폴리오 요약 인포그래픽
 *  'stock'     — 종목 AI 분석 카드
 *
 * 워터마크: 하단 고정 "AIstock" 브랜드 배지
 *
 * @ref — html2canvas 캡처 대상 (forwardRef)
 */
const ShareCard = forwardRef(function ShareCard({ variant = 'portfolio', data = {} }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width:           '360px',
        height:          '640px',
        fontFamily:      '"Pretendard", "Inter", system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        background:      'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
        position:        'relative',
        overflow:        'hidden',
        display:         'flex',
        flexDirection:   'column',
        color:           '#ffffff',
      }}
    >
      {/* 배경 장식 오브 */}
      <Orb top="-60px" left="-60px" color="rgba(99,102,241,0.25)" size="200px" />
      <Orb top="30%"  right="-80px" color="rgba(232,64,64,0.15)"  size="220px" />
      <Orb bottom="20%" left="-40px" color="rgba(37,99,235,0.18)" size="160px" />

      {/* ── 헤더 ── */}
      <CardHeader date={data.date} />

      {/* ── 메인 콘텐츠 ── */}
      <div style={{ flex: 1, padding: '0 24px', overflow: 'hidden' }}>
        {variant === 'portfolio'
          ? <PortfolioContent data={data} />
          : <StockContent data={data} />
        }
      </div>

      {/* ── 워터마크 + 푸터 ── */}
      <Watermark />
    </div>
  );
});

export default ShareCard;

/* ── 헤더 ── */
function CardHeader({ date }) {
  const today = date ?? new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '900', color: '#fff',
        }}>AI</div>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>
          AI<span style={{ color: '#818cf8' }}>stock</span>
        </span>
      </div>
      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{today}</span>
    </div>
  );
}

/* ── 포트폴리오 콘텐츠 ── */
function PortfolioContent({ data }) {
  const {
    totalCurrentValue = 0,
    totalGain = 0,
    totalReturnPct = 0,
    totalCost = 0,
    enrichedPortfolios = [],
  } = data;

  const isUp = totalGain >= 0;
  const gainColor  = isUp ? '#E84040' : '#2563EB';
  const gainBg     = isUp ? 'rgba(232,64,64,0.12)' : 'rgba(37,99,235,0.12)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 타이틀 */}
      <div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>포트폴리오 요약</p>
        <p style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {fmtKRW(totalCurrentValue)}
        </p>
        {/* 손익 배지 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: gainBg, border: `1px solid ${gainColor}30`,
          borderRadius: '12px', padding: '6px 12px', marginTop: '8px',
        }}>
          <span style={{ color: gainColor, fontWeight: '700', fontSize: '16px' }}>
            {isUp ? '▲' : '▼'} {fmtPct(totalReturnPct)}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>
            ({fmtKRW(totalGain, true)})
          </span>
        </div>
      </div>

      {/* 구분선 */}
      <Divider />

      {/* 투자 원금 */}
      <InfoRow label="투자 원금" value={fmtKRW(totalCost)} />
      <InfoRow label="보유 종목" value={`${enrichedPortfolios.length}개`} />

      <Divider />

      {/* 종목 리스트 (최대 5개) */}
      <div>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          보유 종목
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {enrichedPortfolios.slice(0, 5).map((p) => (
            <PortfolioHoldingRow key={p.id} p={p} />
          ))}
          {enrichedPortfolios.length > 5 && (
            <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>
              외 {enrichedPortfolios.length - 5}개 종목
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PortfolioHoldingRow({ p }) {
  const isUp = p.return_pct >= 0;
  const col  = isUp ? '#E84040' : '#2563EB';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{p.stock_name}</p>
        <p style={{ fontSize: '11px', color: '#64748b' }}>{p.stock_symbol}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: col, fontVariantNumeric: 'tabular-nums' }}>
          {isUp ? '▲' : '▼'} {fmtPct(p.return_pct)}
        </p>
        <p style={{ fontSize: '11px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
          {fmtKRW(p.unrealized_gain, true)}
        </p>
      </div>
    </div>
  );
}

/* ── 종목 AI 분석 카드 콘텐츠 ── */
function StockContent({ data }) {
  const {
    symbol = '', stockName = '', market = '',
    currentPrice = 0, returnPct = 0,
    report = null,
    weather = null,
  } = data;

  const isUp     = returnPct >= 0;
  const gainColor = isUp ? '#E84040' : '#2563EB';
  const weatherMeta = weather ? (WEATHER_META[weather] ?? WEATHER_META.cloudy) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 종목 헤더 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.1 }}>{stockName || symbol}</p>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{symbol} · {market}</p>
        </div>
        {weatherMeta && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '28px', lineHeight: 1 }}>{weatherMeta.emoji}</p>
            <p style={{ fontSize: '11px', color: weatherMeta.color, fontWeight: '600', marginTop: '2px' }}>{weatherMeta.label}</p>
          </div>
        )}
      </div>

      {/* 현재가 */}
      <div>
        <p style={{ fontSize: '28px', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: '#f1f5f9' }}>
          {fmtKRW(currentPrice)}
        </p>
        <p style={{ fontSize: '14px', fontWeight: '700', color: gainColor, marginTop: '3px' }}>
          {isUp ? '▲' : '▼'} {fmtPct(returnPct)}
        </p>
      </div>

      <Divider />

      {report ? (
        <>
          {/* 한 줄 요약 */}
          {report.one_liner && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(99,102,241,0.15)',
              borderRadius: '10px',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <p style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '600', marginBottom: '4px' }}>AI 한 줄 시황</p>
              <p style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '600', lineHeight: 1.4 }}>
                {report.one_liner}
              </p>
            </div>
          )}

          {/* 3줄 요약 */}
          {report.full_text && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {report.full_text.split('\n').filter((l) => l.trim()).map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#a5b4fc', flexShrink: 0, marginTop: '1px' }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, flex: 1 }}>{line.trim()}</p>
                </div>
              ))}
            </div>
          )}

          <Divider />

          {/* 호재/악재 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <FactBox title="호재" items={report.positives} color="#E84040" bg="rgba(232,64,64,0.08)" />
            <FactBox title="악재" items={report.negatives} color="#2563EB" bg="rgba(37,99,235,0.08)" />
          </div>

          {/* 신뢰도 */}
          {report.confidence && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b' }}>AI 신뢰도</p>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${report.confidence}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '2px' }} />
              </div>
              <p style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: '700' }}>{report.confidence}%</p>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
          <p style={{ fontSize: '14px' }}>AI 분석을 먼저 생성해주세요</p>
        </div>
      )}
    </div>
  );
}

function FactBox({ title, items = [], color, bg }) {
  return (
    <div style={{ padding: '10px', background: bg, borderRadius: '8px', border: `1px solid ${color}20` }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color, marginBottom: '6px' }}>
        {title === '호재' ? '✅' : '⚠️'} {title}
      </p>
      {items.slice(0, 2).map((item, i) => (
        <p key={i} style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>· {item}</p>
      ))}
      {!items.length && <p style={{ fontSize: '11px', color: '#475569' }}>없음</p>}
    </div>
  );
}

/* ── 공통 레이아웃 헬퍼 ── */
function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />;
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function Orb({ top, bottom, left, right, color, size }) {
  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      width: size, height: size,
      background: color,
      borderRadius: '50%',
      filter: 'blur(60px)',
      pointerEvents: 'none',
    }} />
  );
}

/* ── 워터마크 ── */
function Watermark() {
  return (
    <div style={{
      padding: '12px 24px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '20px', height: '20px', borderRadius: '5px',
          background: 'linear-gradient(135deg, #1A56DB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', fontWeight: '900', color: '#fff',
        }}>AI</div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
          AI<span style={{ color: '#6366f1' }}>stock</span>
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '10px', color: '#334155', lineHeight: 1.3 }}>투자 판단의 책임은 본인에게 있습니다</p>
        <p style={{ fontSize: '10px', color: '#334155' }}>aistock.app</p>
      </div>
    </div>
  );
}
