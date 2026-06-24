"use client";
import { useState } from "react";
import Sparkline from "./Sparkline";

export default function CompareClient({ amcs }) {
  const names = Object.keys(amcs);
  const change = (n) => {
    const p = amcs[n];
    return p[p.length - 1][1] - p[0][1];
  };
  const sorted = [...names].sort((a, b) => change(b) - change(a));
  const [sel, setSel] = useState(sorted.slice(0, 3));

  function toggle(n) {
    setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : s.length >= 3 ? s : [...s, n]));
  }

  return (
    <div>
      <div className="mb-2 text-[12px] text-ink-faint">Pick up to 3 AMCs to compare ({sel.length}/3)</div>
      <div className="mb-6 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
        {sorted.map((n) => {
          const active = sel.includes(n);
          return (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                active ? "border-accent/40 bg-accent/15 text-ink" : "border-line text-ink-muted hover:text-ink"
              }`}
            >
              {n.replace(" Mutual Fund", "")}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {sel.map((n) => {
          const c = change(n);
          return (
            <div key={n} className="glass p-5 animate-fade-up">
              <div className="truncate text-[13px] font-semibold text-ink">{n.replace(" Mutual Fund", "")}</div>
              <div className={`mt-1 text-2xl font-bold tnum ${c >= 0 ? "text-pos" : "text-neg"}`}>
                {c >= 0 ? "+" : ""}{c.toFixed(2)}
              </div>
              <div className="text-[11px] text-ink-faint">30-day equity index Δ</div>
              <div className="mt-3">
                <Sparkline points={amcs[n]} height={48} />
              </div>
              <a href={`/amc/${encodeURIComponent(n)}`} className="mt-3 inline-block text-[12px] text-accent-soft hover:underline">
                View AMC →
              </a>
            </div>
          );
        })}
        {sel.length === 0 && <div className="text-[13px] text-ink-muted">Select an AMC above to begin.</div>}
      </div>
    </div>
  );
}
