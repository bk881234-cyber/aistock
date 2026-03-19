import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/marketStore';

/**
 * 시장 데이터 자동 폴링 훅
 *
 * @param {object}  options
 * @param {number}  options.intervalMs - 폴링 주기 (기본 30초)
 * @param {boolean} options.autoStart  - 마운트 시 자동 시작 (기본 true)
 *
 * @returns {{ indices, fx, commodities, lastUpdated, loading, error,
 *             getIndex, getFx, getCommodity }}
 *
 * @example
 *   const { getIndex } = useMarketData();
 *   const kospi = getIndex('KOSPI');
 */
const useMarketData = ({ intervalMs = 30_000, autoStart = true } = {}) => {
  const {
    indices, fx, commodities, lastUpdated, loading, error,
    getIndex, getFx, getCommodity,
    startPolling, stopPolling,
  } = useMarketStore();

  const started = useRef(false);

  useEffect(() => {
    if (!autoStart || started.current) return;
    started.current = true;
    startPolling(intervalMs);

    return () => {
      // 컴포넌트 언마운트 시 폴링 중지 (AppLayout에서만 사용하므로 실제로는 호출 안 됨)
      // 만약 단독 사용 시 stopPolling() 호출
    };
  }, [autoStart, intervalMs, startPolling]);

  return { indices, fx, commodities, lastUpdated, loading, error, getIndex, getFx, getCommodity };
};

export default useMarketData;
