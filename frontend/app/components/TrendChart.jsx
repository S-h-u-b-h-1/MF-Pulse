"use client";
import { useRef, useState } from "react";

// Interactive area chart for the 30-day equity index (all-AMC aggregate).
export default function TrendChart({ series, height = 240 }) {
  const ref = useRef(null);
  const [hi, setHi] = useState(null);
  if (!series || series.length < 2) return null;

  const W = 1000;
  const H = height;
  const pad = { l: 6, r: 6, t: 18, b: 26 };
  const vals = series.map((p) => p[1]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const n = series.length;
  const x = (i) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / range) * (H - pad.t - pad.b);
  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  const up = vals[n - 1] >= vals[0];
  const stroke = up ? "#34d399" : "#f87171";
  const grid = [max, (max + min) / 2, min];

  function move(e) {
    const r = ref.current.getBoundingClientRect();
    const rx = ((e.clientX - r.left) / r.width) * W;
    let i = Math.round(((rx - pad.l) / (W - pad.l - pad.r)) * (n - 1));
    setHi(Math.max(0, Math.min(n - 1, i)));
  }
  const hp = hi != null ? series[hi] : null;

  return (
    <div className="chart" onMouseLeave={() => setHi(null)}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="chart-svg" onMouseMove={move}>
        <defs>
          <linearGradient id="trendfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((g, i) => (
          <line key={i} x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} className="chart-grid" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#trendfill)" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {hp && (
          <>
            <line x1={x(hi)} x2={x(hi)} y1={pad.t} y2={H - pad.b} className="chart-cross" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hi)} cy={y(hp[1])} r="4.5" fill={stroke} stroke="#0a0e1a" strokeWidth="2" />
          </>
        )}
      </svg>
      <div className="chart-axis">
        <span>{series[0][0]}</span>
        <span>{series[n - 1][0]}</span>
      </div>
      <div className="chart-read">{hp ? `${hp[0]} · ${hp[1].toFixed(2)}` : `index ${min.toFixed(1)}–${max.toFixed(1)}`}</div>
    </div>
  );
}
