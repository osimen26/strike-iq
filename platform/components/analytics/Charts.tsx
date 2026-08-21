"use client";

import React from "react";

// ─── Pure SVG Line / Area Chart ─────────────────────────────────────────────
export function AreaChart({ data, color = "var(--primary-600)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const w = 400; const h = 120; const pad = 10;
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#111" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
export function DonutChart({ won, lost }: { won: number; lost: number }) {
  const total = won + lost || 1;
  const winPct = (won / total) * 100;
  const r = 40; const cx = 60; const cy = 60;
  const circ = 2 * Math.PI * r;
  const wonDash = (winPct / 100) * circ;
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth="14"
        strokeDasharray={`${circ - wonDash} ${wonDash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary-600)" strokeWidth="14"
        strokeDasharray={`${wonDash} ${circ - wonDash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{Math.round(winPct)}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="8">Win Rate</text>
    </svg>
  );
}

// ─── Horizontal Bar Chart ────────────────────────────────────────────────────
export function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 font-medium">{d.label}</span>
            <span className="font-mono text-white font-bold">{d.value}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#18181c] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color || "var(--primary-600)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
