import { useMarketStore } from '@/store/marketStore';
import IndexChartCard from './IndexChartCard';
import IndexCard from './IndexCard';
import FxCard from './FxCard';
import CommodityGauge from './CommodityGauge';

// Row 1: 주요 4대 지수 (차트 포함)
const ROW1 = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX'];
// Row 2: 보조 지수 + 환율
const ROW2_IDX = ['DOW', 'VIX'];
const FX_ORDER  = ['USD_KRW', 'EUR_KRW', 'JPY_KRW'];

export default function MacroSection() {
  const { indices, fx, commodities, loading, lastUpdated } = useMarketStore();

  const row1    = ROW1.map((s) => indices.find((i) => i.symbol === s) ?? null);
  const row2Idx = ROW2_IDX.map((s) => indices.find((i) => i.symbol === s) ?? null);
  const shownFx = FX_ORDER.map((s) => fx.find((f) => f.symbol === s) ?? null);
  const gold    = commodities.find((c) => c.symbol === 'GOLD_USD') ?? null;
  const silver  = commodities.find((c) => c.symbol === 'SILVER_USD') ?? null;
  const usdKrw  = fx.find((f) => f.symbol === 'USD_KRW')?.current_val ?? 0;

  return (
    <div className="space-y-3">
      {/* Row 1: 주요 4대 지수 (차트 카드) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {row1.map((idx, i) => (
          <IndexChartCard key={ROW1[i]} data={idx} />
        ))}
      </div>

      {/* Row 2: 다우(3) + VIX(3) + USD(2) + EUR(2) + JPY(2) = 12 */}
      <div className="grid grid-cols-12 gap-3">
        {row2Idx.map((idx, i) => (
          <div key={ROW2_IDX[i]} className="col-span-3">
            <IndexCard data={idx} compact />
          </div>
        ))}
        {shownFx.map((f, i) => (
          <div key={FX_ORDER[i]} className="col-span-2">
            <FxCard data={f} compact />
          </div>
        ))}
      </div>

      {/* Row 3: 금 + 은 (원자재, KRW 환산) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CommodityGauge data={gold}   label="금 (Gold)"   usdKrw={usdKrw} />
        <CommodityGauge data={silver} label="은 (Silver)" usdKrw={usdKrw} />
      </div>

      {lastUpdated && (
        <p className="text-sm text-text-muted text-right">
          업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          {loading && <span className="ml-1 text-primary animate-pulse">●</span>}
        </p>
      )}
    </div>
  );
}
