import { useRef, useState } from 'react';
import ShareCard from './ShareCard';
import useExport from '@/hooks/useExport';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * 이미지 내보내기 모달
 *
 * @param {'portfolio'|'stock'} variant
 * @param {object} data    ShareCard에 전달할 데이터
 * @param {function} onClose
 */
export default function ExportModal({ variant, data, onClose }) {
  const cardRef = useRef(null);
  const { exportImage, copyToClipboard, exporting } = useExport();
  const [copied, setCopied] = useState(false);

  const filename = variant === 'portfolio'
    ? `aistock-portfolio-${new Date().toISOString().slice(0, 10)}`
    : `aistock-${data?.symbol ?? 'stock'}-${new Date().toISOString().slice(0, 10)}`;

  const handleDownload = async () => {
    try {
      await exportImage(cardRef, filename, { scale: 3 });
      toast.success('이미지가 저장되었습니다 (3x 고해상도)');
    } catch {
      toast.error('이미지 저장에 실패했습니다.');
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cardRef, { scale: 3 });
    if (ok) {
      setCopied(true);
      toast.success('클립보드에 복사되었습니다!');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('클립보드 복사 실패 (브라우저 권한 확인)');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">카드 내보내기</h2>
            <p className="text-xs text-text-muted mt-0.5">
              블로그 · 핀터레스트 최적화 세로형 카드 (9:16)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface2 text-text-muted transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 카드 미리보기 */}
        <div className="flex justify-center py-6 px-5 bg-surface2 overflow-auto">
          {/* 스케일 다운 (360×640 → 미리보기 240×427) */}
          <div style={{ transform: 'scale(0.667)', transformOrigin: 'top center', width: '360px', height: '640px', flexShrink: 0 }}>
            <ShareCard ref={cardRef} variant={variant} data={data} />
          </div>
        </div>

        {/* 액션 */}
        <div className="px-5 py-4 border-t border-border space-y-3">
          {/* 내보내기 옵션 안내 */}
          <div className="flex gap-2 text-xs text-text-muted bg-surface2 rounded-xl px-3 py-2.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>1080×1920 고해상도 PNG로 저장됩니다. 워터마크가 포함되어 있어 SNS에 바로 올릴 수 있습니다.</span>
          </div>

          <div className="flex gap-2">
            {/* 클립보드 복사 */}
            <button
              onClick={handleCopy}
              disabled={exporting}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                copied
                  ? 'bg-safe/10 border-safe/30 text-safe'
                  : 'border-border text-text-secondary hover:bg-surface2',
              )}
            >
              {copied
                ? <><span>✓</span> 복사됨</>
                : <><CopyIcon /> 클립보드 복사</>
              }
            </button>

            {/* PNG 다운로드 */}
            <button
              onClick={handleDownload}
              disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 btn-primary py-2.5 text-sm"
            >
              {exporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  캡처 중...
                </>
              ) : (
                <><DownloadIcon /> PNG 저장</>
              )}
            </button>
          </div>

          {/* SNS 공유 힌트 */}
          <div className="flex gap-2 justify-center text-xs text-text-muted pt-1">
            <SnsHint label="핀터레스트" />
            <span>·</span>
            <SnsHint label="블로그" />
            <span>·</span>
            <SnsHint label="인스타그램 스토리" />
            <span>·</span>
            <SnsHint label="카카오스토리" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SnsHint({ label }) {
  return <span className="text-primary/70 font-medium">{label}</span>;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
