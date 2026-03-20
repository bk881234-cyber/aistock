import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

/**
 * html2canvas 기반 이미지 내보내기 훅
 *
 * - 3x 고해상도 렌더링 (SNS 고품질)
 * - 외부 폰트/이미지 CORS 처리
 * - 다운로드 + 클립보드 복사 지원
 */
const useExport = () => {
  const [exporting, setExporting] = useState(false);

  /**
   * DOM 요소 → PNG 다운로드
   * @param {React.RefObject} ref     캡처할 DOM 요소의 ref
   * @param {string} filename         저장 파일명 (확장자 제외)
   * @param {{ scale?, bg? }} options
   */
  const exportImage = useCallback(async (ref, filename = 'aistock-card', options = {}) => {
    if (!ref.current || exporting) return;
    setExporting(true);

    try {
      const el     = ref.current;
      const scale  = options.scale ?? 3;       // 3x → 고해상도
      const bg     = options.bg    ?? '#ffffff';

      const canvas = await html2canvas(el, {
        scale,
        backgroundColor: bg,
        useCORS:         true,
        allowTaint:      false,
        logging:         false,
        // 캡처 직전 렌더 완료 대기
        onclone: (doc) => {
          // 클론 내 애니메이션 중지 (blur/pulse 제거)
          const style = doc.createElement('style');
          style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
          doc.head.appendChild(style);
        },
      });

      // PNG 다운로드
      const link   = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href     = canvas.toDataURL('image/png', 1.0);
      link.click();

      return canvas;
    } catch (err) {
      console.error('[useExport] 캡처 실패:', err.message);
      throw err;
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  /**
   * DOM 요소 → 클립보드 복사
   */
  const copyToClipboard = useCallback(async (ref, options = {}) => {
    if (!ref.current || exporting) return false;
    setExporting(true);
    try {
      const canvas = await html2canvas(ref.current, {
        scale:           options.scale ?? 3,
        backgroundColor: options.bg    ?? '#ffffff',
        useCORS:         true,
        allowTaint:      false,
        logging:         false,
      });

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png', 1.0));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    } catch {
      return false;
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return { exportImage, copyToClipboard, exporting };
};

export default useExport;
