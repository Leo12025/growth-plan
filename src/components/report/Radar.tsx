"use client";

import { RADAR_DIMS } from "@/lib/report";

/** 六维能力雷达图（纯 SVG 渲染，无外部依赖） */
export default function Radar({
  scores,
  size = 220,
  color = "#4f46e5",
}: {
  scores: number[]; // 1-5
  size?: number;
  color?: string;
}) {
  const dims = RADAR_DIMS;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;

  function point(i: number, value: number) {
    const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
    const rr = (value / 5) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  }

  const rings = [1, 2, 3, 4, 5].map((v) =>
    dims
      .map((_, i) => point(i, v).map((n) => n.toFixed(1)).join(","))
      .join(" ")
  );

  const dataPoints = dims
    .map((_, i) => point(i, scores[i] ?? 3).map((n) => n.toFixed(1)).join(","))
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((points, idx) => (
        <polygon
          key={idx}
          points={points}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}
      {dims.map((_, i) => {
        const [x, y] = point(i, 5);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={dataPoints}
        fill={`${color}33`}
        stroke={color}
        strokeWidth={2}
      />
      {dims.map((label, i) => {
        const [x, y] = point(i, 6.2);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="#475569"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
