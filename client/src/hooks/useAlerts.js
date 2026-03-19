import { useEffect } from 'react';
import { useAlertStore } from '@/store/alertStore';

/**
 * 알림 데이터 훅 (30초마다 폴링)
 */
const useAlerts = () => {
  const { alerts, history, unreadCount, fetchAlerts, fetchHistory, markAllRead } =
    useAlertStore();

  useEffect(() => {
    fetchAlerts();
    fetchHistory();

    const timer = setInterval(() => {
      fetchHistory(); // 30초마다 알림 이력 갱신
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  return { alerts, history, unreadCount, fetchAlerts, fetchHistory, markAllRead };
};

export default useAlerts;
