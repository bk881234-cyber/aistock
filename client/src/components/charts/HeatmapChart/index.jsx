import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3.js 상관관계 히트맵
 * @param {Array} data   - [{ x: 'KOSPI', y: 'NASDAQ', value: 0.85 }, ...]
 * @param {Array} labels - ['KOSPI', 'KOSDAQ', 'NASDAQ', ...]
 */
export default function HeatmapChart({ data = [], labels = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !labels.length || !svgRef.current) return;

    const el     = svgRef.current;
    const margin = { top: 30, right: 10, bottom: 10, left: 60 };
    const n      = labels.length;
    const cellSz = Math.min(48, (el.parentElement?.clientWidth ?? 320) / (n + 1.5));
    const width  = n * cellSz + margin.left + margin.right;
    const height = n * cellSz + margin.top  + margin.bottom;

    const svg = d3.select(el);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 색상 스케일: -1(빨강) → 0(흰색) → 1(초록)
    const colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['#E84040', '#F9FAFB', '#0FA36E']);

    const x = d3.scaleBand().domain(labels).range([0, n * cellSz]).padding(0.05);
    const y = d3.scaleBand().domain(labels).range([0, n * cellSz]).padding(0.05);

    // 셀
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.x))
      .attr('y', (d) => y(d.y))
      .attr('width',  x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d) => colorScale(d.value))
      .append('title')
      .text((d) => `${d.x} ↔ ${d.y}: ${d.value.toFixed(2)}`);

    // 셀 내 수치
    g.selectAll('text.cell')
      .data(data)
      .join('text')
      .attr('class', 'cell')
      .attr('x', (d) => x(d.x) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.y) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', cellSz > 36 ? '10px' : '8px')
      .attr('font-weight', '600')
      .attr('fill', (d) => Math.abs(d.value) > 0.5 ? '#fff' : '#374151')
      .text((d) => d.value.toFixed(2));

    // X축 레이블
    g.selectAll('text.x-label')
      .data(labels)
      .join('text')
      .attr('class', 'x-label')
      .attr('x', (l) => x(l) + x.bandwidth() / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .text((l) => l);

    // Y축 레이블
    g.selectAll('text.y-label')
      .data(labels)
      .join('text')
      .attr('class', 'y-label')
      .attr('x', -8)
      .attr('y', (l) => y(l) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .text((l) => l);
  }, [data, labels]);

  if (!data.length) return null;

  return (
    <div className="card">
      <p className="section-title">📊 지수 상관관계 히트맵</p>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="block mx-auto" />
      </div>
      {/* 범례 */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-text-muted">
        <span className="w-4 h-3 rounded bg-bear inline-block" />
        <span>음의 상관(-1)</span>
        <span className="w-4 h-3 rounded bg-border inline-block ml-2" />
        <span>무상관(0)</span>
        <span className="w-4 h-3 rounded bg-bull inline-block ml-2" />
        <span>양의 상관(+1)</span>
      </div>
    </div>
  );
}
