import { useState, useEffect } from 'react';
import { getReport, generateReport, getRelatedNews } from '@/api/aiApi';
import { fmtDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import ExportModal from '@/components/export/ExportModal';

/**
 * AI 3줄 요약 리포트 컴포넌트
 * @param {string} symbol
 * @param {object} [stockData]  ShareCard에 전달할 종목 데이터 (symbol, stockName, market, currentPrice, returnPct, weather)
 */
export default function AIReport({ symbol, stockData }) {
  const [report,      setReport]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [generated,   setGenerated]   = useState(false);
  const [exportOpen,  setExportOpen]  = useState(false);
  const [news,        setNews]        = useState([]);

  useEffect(() => {
    getRelatedNews(symbol).then(setNews).catch(() => {});
  }, [symbol]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReport(symbol);
      setReport(data);
    } catch { /* 무시 */ }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const data = await generateReport(symbol);
      setReport(data);
      setGenerated(true);
      toast.success('AI 리포트가 생성되었습니다.');
    } catch {
      toast.error('리포트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!report && !loading) {
    return (
      <div className="card space-y-4">
        <div className="flex flex-col items-center py-4 text-center border border-dashed border-border rounded-xl">
          <span className="text-3xl mb-2">🤖</span>
          <p className="text-sm font-medium text-text-secondary">AI 3줄 요약 리포트</p>
          <p className="text-xs text-text-muted mt-1 mb-4">
            현재 뉴스와 기술적 지표를 종합한 AI 분석을 받아보세요
          </p>
          <div className="flex gap-2">
            <button onClick={load}     className="btn-ghost text-xs">캐시 조회</button>
            <button onClick={generate} className="btn-primary text-xs">🤖 AI 생성</button>
          </div>
        </div>
        {news.length > 0 && (
          <div className="bg-surface2 rounded-lg px-4 py-3 space-y-2">
            <p className="text-xs font-medium text-text-muted">📰 관련 뉴스</p>
            {news.map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                className="block group">
                <p className="text-xs text-text-secondary group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                  {n.title}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {n.publisher} · {n.timeLabel}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">AI가 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  const confidence = report?.confidence ?? 0;

  return (
    <div className="card space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <p className="font-bold text-text-primary">AI 분석 리포트</p>
          {generated && <span className="badge-bull text-[10px]">방금 생성</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted">
            신뢰도{' '}
            <span className={clsx(
              'font-bold',
              confidence >= 70 ? 'text-bull' : confidence >= 50 ? 'text-yellow-500' : 'text-bear'
            )}>
              {confidence}%
            </span>
          </span>
          <button onClick={generate} disabled={loading} className="btn-ghost text-xs">
            새로고침
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="btn-ghost text-xs flex items-center gap-1"
            title="카드 이미지로 내보내기"
          >
            <ShareIcon />
            내보내기
          </button>
        </div>
      </div>

      {/* 한 줄 시황 */}
      {report.one_liner && (
        <div className="bg-primary-light rounded-lg px-4 py-2.5">
          <p className="text-sm font-semibold text-primary">💬 {report.one_liner}</p>
        </div>
      )}

      {/* 3줄 요약 */}
      <div className="bg-surface2 rounded-lg px-4 py-3">
        <p className="text-xs font-medium text-text-muted mb-2">3줄 요약</p>
        {report.full_text?.split('\n').map((line, i) => (
          line.trim() && (
            <p key={i} className="text-sm text-text-secondary leading-relaxed">
              {i + 1}. {line.trim()}
            </p>
          )
        ))}
      </div>

      {/* 호재/악재 */}
      <div className="grid grid-cols-2 gap-3">
        <FactList
          title="호재 요인"
          items={report.positives}
          icon="✅"
          className="bg-bull-light"
          textClass="text-bull"
        />
        <FactList
          title="악재 요인"
          items={report.negatives}
          icon="⚠️"
          className="bg-bear-light"
          textClass="text-bear"
        />
      </div>

      {/* 관련 뉴스 */}
      {news.length > 0 && (
        <div className="bg-surface2 rounded-lg px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-text-muted">📰 관련 뉴스</p>
          {news.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
              className="block group">
              <p className="text-xs text-text-secondary group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                {n.title}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {n.publisher} · {n.timeLabel}
              </p>
            </a>
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted text-right">
        생성: {fmtDateTime(report.generated_at)} · 만료: {fmtDateTime(report.expires_at)}
      </p>

      {exportOpen && (
        <ExportModal
          variant="stock"
          data={{ ...stockData, report }}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function FactList({ title, items = [], icon, className, textClass }) {
  return (
    <div className={clsx('rounded-lg p-3', className)}>
      <p className={clsx('text-xs font-semibold mb-1.5', textClass)}>{icon} {title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">없음</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-text-secondary">· {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
