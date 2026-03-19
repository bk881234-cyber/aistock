import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * D3.js 스파크라인
 * @param {Array}  data    - [{ t: timestamp_ms, v: number }, ...]
 * @param {number} width
 * @param {number} height
 * @param {string} color   - 선 색상
 * @param {boolean} filled - 아래 영역 채움 여부
 */
export default function SparkLine({ data = [], width = 100, height = 40, color = '#1A56DB', filled = true }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 2, right: 2, bottom: 2, left: 2 };
    const w = width  - margin.left - margin.right;
    const h = height - margin.top  - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.t)))
      .range([0, w]);

    const yExtent = d3.extent(data, (d) => d.v);
    const yPad    = (yExtent[1] - yExtent[0]) * 0.1 || 1;
    const yScale  = d3.scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([h, 0]);

    const line = d3.line()
      .x((d) => xScale(new Date(d.t)))
      .y((d) => yScale(d.v))
      .curve(d3.curveCatmullRom);

    // 채움 영역
    if (filled) {
      const area = d3.area()
        .x((d) => xScale(new Date(d.t)))
        .y0(h)
        .y1((d) => yScale(d.v))
        .curve(d3.curveCatmullRom);

      const gradId = `spark-grad-${Math.random().toString(36).slice(2)}`;
      const defs = svg.append('defs');
      const grad = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0').attr('y1', '0')
        .attr('x2', '0').attr('y2', '1');
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.2);
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0);

      g.append('path')
        .datum(data)
        .attr('fill', `url(#${gradId})`)
        .attr('d', area);
    }

    // 선
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // 마지막 점
    const last = data[data.length - 1];
    g.append('circle')
      .attr('cx', xScale(new Date(last.t)))
      .attr('cy', yScale(last.v))
      .attr('r', 2.5)
      .attr('fill', color);
  }, [data, width, height, color, filled]);

  return <svg ref={svgRef} className="block" />;
}
