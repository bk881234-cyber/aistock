import { useMarketStore } from '@/store/marketStore';
import IndexCard from './IndexCard';
import FxCard from './FxCard';
import CommodityGauge from './CommodityGauge';

const INDEX_ORDER = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX'];
const FX_ORDER    = ['USD_KRW', 'EUR_KRW', 'JPY_KRW'];

export default function MacroSection() {
  const { indices, fx, commodities } = useMarketStore();

  const shownIndices = INDEX_ORDER
    .map((s) => indices.find((i) => i.symbol === s))
    .filter(Boolean);

  const shownFx = FX_ORDER
    .map((s) => fx.find((f) => f.symbol === s))
    .filter(Boolean);

  const gold   = commodities.find((c) => c.symbol === 'GOLD_USD');
  const silver = commodities.find((c) => c.symbol === 'SILVER_USD');

  return (
    <div className="space-y-3">
      {/* 지수 카드 4열 */}
      <div className="grid grid-cols-4 gap-3">
        {shownIndices.map((idx) => (
          <IndexCard key={idx.symbol} data={idx} />
        ))}
      </div>

      {/* 환율 스파크라인 + 원자재 게이지 */}
      <div className="grid grid-cols-12 gap-3">
        {/* 환율 3칸 */}
        {shownFx.map((f) => (
          <div key={f.symbol} className="col-span-3">
            <FxCard data={f} />
          </div>
        ))}
        {/* 금 게이지 */}
        <div className="col-span-2">
          <CommodityGauge data={gold} label="금" emoji="🥇" />
        </div>
        {/* 은 게이지 */}
        <div className="col-span-1">
          <CommodityGauge data={silver} label="은" emoji="🥈" />
        </div>
      </div>
    </div>
  );
}
