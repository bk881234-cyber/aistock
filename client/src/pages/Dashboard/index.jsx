import MacroSection from '@/components/dashboard/MacroSection';
import PortfolioSection from '@/components/dashboard/PortfolioSection';
import WatchlistSection from '@/components/dashboard/WatchlistSection';
import AlertPanel from '@/components/dashboard/AlertPanel';

/**
 * 메인 대시보드
 * ┌─────────────────────────────────────────────────────┐
 * │  MacroSection (지수 6개 + 환율 3개 + 원자재 2개)    │
 * ├──────────────────────────────┬──────────────────────┤
 * │  PortfolioSection (보유종목)  │  WatchlistSection    │
 * │                              │  AlertPanel          │
 * └──────────────────────────────┴──────────────────────┘
 */
export default function Dashboard() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* 매크로 지표 풀-width */}
      <MacroSection />

      {/* 좌/우 2열 */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <PortfolioSection />
        </div>
        <div className="col-span-4 flex flex-col gap-5">
          <WatchlistSection />
          <AlertPanel />
        </div>
      </div>
    </div>
  );
}
