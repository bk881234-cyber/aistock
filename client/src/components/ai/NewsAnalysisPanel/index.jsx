import { useState } from 'react';
import { getNewsAnalysis } from '@/api/aiApi';
import clsx from 'clsx';

/**
 * 뉴스 기반 AI 호재/악재 분석 패널
 *
 * 주가 급등락(기본 ±3% 이상) 시 뉴스를 수집해 Gemini AI가
 * 호재/악재를 3줄로 요약합니다.
 *
 * @param {string}  symbol
 * @param {number}  priceChangePct  당일 등락률 (없으면 0)
 * @param {boolean} [autoExpand]    등락 ≥ threshold 이면 기본 펼침
 */
const SPIKE_THRESHOLD = 3; // ±3% 이상이면 급등락 배지 표시

export default function NewsAnalysisPanel({ symbol, priceChangePct = 0, autoExpand = false }) {
  const isSpike    = Math.abs(priceChangePct) >= SPIKE_THRESHOLD;
  const [open,     setOpen]     = useState(autoExpand && isSpike);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const analyze = async () => {
    if (result) return;           // 이미 분석됨
    setLoading(true);
    setError(null);
    try {
      const data = await getNewsAnalysis(symbol, priceChangePct);
      setResult(data);
    } catch {
      setError('뉴스 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open && !result) analyze();
    setOpen((v) => !v);
  };

  const direction   = priceChangePct >= 0 ? '급등' : '급락';
  const dirColor    = priceChangePct >= 0 ? 'text-bull' : 'text-bear';
  const spikeColor  = priceChangePct >= 0 ? 'bg-bull/8 border-bull/20' : 'bg-bear/8 border-bear/20';

  return (
    <div className="card p-0 overflow-hidden">
      {/* 헤더 버튼 */}
      <button
        onClick={handleToggle}
        className={clsx(
          'w-full flex items-center justify-between px-5 py-3.5 transition-colors text-left',
          open ? 'border-b border-border bg-surface2' : 'hover:bg-surface2',
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">📰</span>
          <span className="font-semibold text-text-primary text-sm">AI 뉴스 분석</span>

          {isSpike && (
            <span className={clsx(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full border',
              spikeColor, dirColor,
            )}>
              {priceChangePct >= 0 ? '▲' : '▼'} {Math.abs(priceChangePct).toFixed(1)}% {direction}
            </span>
          )}

          {result && (
            <span className="text-[10px] text-text-muted">캐시 결과</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-text-muted">
          {!result && !loading && (
            <span className="text-[11px]">클릭하여 분석</span>
          )}
          <ChevronIcon open={open} />
        </div>
      </button>

      {/* 분석 결과 패널 */}
      {open && (
        <div className="px-5 py-4 space-y-4 animate-fade-in">
          {loading && <AnalysisLoading />}
          {error   && <p className="text-sm text-danger">{error}</p>}
          {result  && <AnalysisResult result={result} />}
        </div>
      )}
    </div>
  );
}

/* ── 로딩 상태 ── */
function AnalysisLoading() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-text-secondary">뉴스를 수집하고 있습니다...</p>
        <p className="text-xs text-text-muted">Gemini AI가 호재/악재를 분석 중입니다</p>
      </div>
    </div>
  );
}

/* ── 결과 ── */
function AnalysisResult({ result }) {
  const confidence = result.confidence ?? 0;

  return (
    <div className="space-y-3">
      {/* 한 줄 시황 */}
      {result.one_liner && (
        <div className="bg-primary/8 border border-primary/15 rounded-xl px-4 py-3">
          <p className="text-[11px] font-semibold text-primary mb-1">💬 AI 한 줄 시황</p>
          <p className="text-sm font-semibold text-text-primary leading-relaxed">{result.one_liner}</p>
        </div>
      )}

      {/* 3줄 요약 */}
      {result.full_text && (
        <div className="space-y-1.5">
          {result.full_text.split('\n').filter((l) => l.trim()).map((line, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-surface3 flex items-center justify-center text-[10px] font-bold text-text-muted flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">{line.trim()}</p>
            </div>
          ))}
        </div>
      )}

      {/* 호재/악재 */}
      <div className="grid grid-cols-2 gap-2.5">
        <FactBox title="호재" items={result.positives} color="text-bull" bg="bg-bull/8 border-bull/15" icon="✅" />
        <FactBox title="악재" items={result.negatives} color="text-bear" bg="bg-bear/8 border-bear/15" icon="⚠️" />
      </div>

      {/* 신뢰도 + 시각 */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[11px] text-text-muted flex-shrink-0">AI 신뢰도</span>
        <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className={clsx(
          'text-[11px] font-bold flex-shrink-0',
          confidence >= 70 ? 'text-safe' : confidence >= 50 ? 'text-yellow-500' : 'text-danger',
        )}>
          {confidence}%
        </span>
        <span className="text-[11px] text-text-muted ml-auto">
          {new Date(result.analyzedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function FactBox({ title, items = [], color, bg, icon }) {
  return (
    <div className={clsx('rounded-xl p-3 border', bg)}>
      <p className={clsx('text-[11px] font-bold mb-2', color)}>{icon} {title}</p>
      {items.length === 0
        ? <p className="text-[11px] text-text-muted">없음</p>
        : items.slice(0, 3).map((item, i) => (
            <p key={i} className="text-[11px] text-text-secondary leading-relaxed">· {item}</p>
          ))
      }
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx('w-4 h-4 transition-transform', open && 'rotate-180')}
      fill="none" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
