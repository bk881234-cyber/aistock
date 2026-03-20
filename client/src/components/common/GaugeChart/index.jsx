import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3.js 반원 게이지 차트
 * @param {number} value    0~100 (52주 범위 내 위치)
 * @param {number} size     지름 px
 * @param {number|null} vix VIX 지수 (null이면 기본 그린 팔레트)
 *
 * VIX 연동 색상:
 *  VIX < 20  → 안전(녹색 계열)
 *  VIX 20-30 → 주의(오렌지 계열)
 *  VIX 30+   → 위험(빨강 계열)
 */
export default function GaugeChart({ value = 50, size = 92, vix = null }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const r  = size / 2;
    const th = Math.max(8, size * 0.12); // 트랙 두께
    const W  = size;
    const H  = r + 10;

    svg.attr('width', W).attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${r},${r})`);

    // ── VIX → 색상 결정 ────────────────────────────────
    let fillColor, trackColor;
    if (vix === null || vix === undefined) {
      // VIX 없으면 value 기반 기본 색상
      fillColor  = d3.scaleLinear().domain([0,50,100]).range(['#60A5FA','#16A34A','#F59E0B'])(Math.max(0, Math.min(100, value)));
      trackColor = '#F3F4F6';
    } else if (vix >= 30) {
      // 고공포 — 붉은 팔레트
      fillColor  = `hsl(${Math.max(0, 10 - (vix - 30) * 0.3)}, 80%, 48%)`;
      trackColor = '#FEE2E2';
    } else if (vix >= 20) {
      // 주의 — 오렌지 팔레트
      const t = (vix - 20) / 10; // 0~1
      fillColor  = d3.interpolate('#16A34A', '#EA580C')(t);
      trackColor = '#FFF7ED';
    } else {
      // 안전 — 녹색 팔레트
      fillColor  = '#16A34A';
      trackColor = '#F0FDF4';
    }

    // ── 배경 아크 ────────────────────────────────────────
    const bgArc = d3.arc()
      .innerRadius(r - th).outerRadius(r)
      .startAngle(-Math.PI / 2).endAngle(Math.PI / 2);

    g.append('path').attr('d', bgArc()).attr('fill', trackColor);

    // ── 값 아크 ──────────────────────────────────────────
    const clamp = Math.max(0, Math.min(100, value));
    const angle = -Math.PI / 2 + (Math.PI * clamp) / 100;

    // 그라디언트 정의
    const gradId = `gauge-grad-${Math.random().toString(36).slice(2)}`;
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', gradId).attr('x1','1').attr('y1','0').attr('x2','0').attr('y2','0');
    grad.append('stop').attr('offset','0%').attr('stop-color', fillColor).attr('stop-opacity', 1);
    grad.append('stop').attr('offset','100%').attr('stop-color', fillColor).attr('stop-opacity', 0.6);

    const valArc = d3.arc()
      .innerRadius(r - th).outerRadius(r)
      .startAngle(-Math.PI / 2).endAngle(angle)
      .cornerRadius(2);

    g.append('path').attr('d', valArc()).attr('fill', `url(#${gradId})`);

    // ── 바늘 ─────────────────────────────────────────────
    const needleLen = r - th - 5;
    const nx = needleLen * Math.cos(angle - Math.PI / 2);
    const ny = needleLen * Math.sin(angle - Math.PI / 2);

    g.append('line')
      .attr('x1', 0).attr('y1', 0).attr('x2', nx).attr('y2', ny)
      .attr('stroke', '#374151').attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round');

    g.append('circle').attr('r', 3).attr('fill', '#374151');

    // ── 중앙 숫자 ─────────────────────────────────────────
    g.append('text')
      .attr('y', 16).attr('text-anchor', 'middle')
      .attr('font-size', '11px').attr('font-weight', '700')
      .attr('fill', fillColor)
      .text(`${Math.round(clamp)}%`);
  }, [value, size, vix]);

  return <svg ref={svgRef} className="block mx-auto" />;
}
