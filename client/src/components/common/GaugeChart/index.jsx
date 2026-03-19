import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3.js 반원 게이지 차트 (안전자산 선호도)
 * @param {number} value  - 0 ~ 100
 * @param {number} size   - 지름 (px)
 */
export default function GaugeChart({ value = 50, size = 80 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const r  = size / 2;
    const th = (size * 0.12); // 트랙 두께

    svg.attr('width', size).attr('height', r + 8);

    const g = svg.append('g').attr('transform', `translate(${r},${r})`);

    // 배경 아크
    const bgArc = d3.arc()
      .innerRadius(r - th)
      .outerRadius(r)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append('path').attr('d', bgArc()).attr('fill', '#E5E7EB');

    // 값 아크 (0~100 → -π/2 ~ π/2)
    const clamp  = Math.max(0, Math.min(100, value));
    const angle  = -Math.PI / 2 + (Math.PI * clamp) / 100;

    // 색상: 낮음=파랑(안전), 높음=황금(위험 경계)
    const colorScale = d3.scaleLinear()
      .domain([0, 50, 100])
      .range(['#60A5FA', '#0FA36E', '#F59E0B']);

    const valArc = d3.arc()
      .innerRadius(r - th)
      .outerRadius(r)
      .startAngle(-Math.PI / 2)
      .endAngle(angle)
      .cornerRadius(2);

    g.append('path')
      .attr('d', valArc())
      .attr('fill', colorScale(clamp));

    // 바늘
    const needleLen = r - th - 4;
    const nx = needleLen * Math.cos(angle - Math.PI / 2);
    const ny = needleLen * Math.sin(angle - Math.PI / 2);

    g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', nx).attr('y2', ny)
      .attr('stroke', '#374151')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round');

    g.append('circle').attr('r', 3).attr('fill', '#374151');

    // 숫자 레이블
    g.append('text')
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#374151')
      .text(`${Math.round(clamp)}%`);
  }, [value, size]);

  return <svg ref={svgRef} className="block mx-auto" />;
}
