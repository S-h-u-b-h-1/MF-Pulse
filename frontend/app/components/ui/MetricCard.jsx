export default function MetricCard({ value, label, sub, tone = "neutral", delta, style }) {
  const valueTone = { pos: "text-pos", neg: "text-neg", neutral: "text-ink" }[tone];
  const edge = {
    pos: "from-pos/70",
    neg: "from-neg/70",
    neutral: "from-accent/60",
  }[tone];
  return (
    <div className="group relative glass p-5 sm:p-6 overflow-hidden animate-fade-up" style={style}>
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${edge} to-transparent`} />
      <div className="flex items-baseline gap-2">
        <div className={`text-[26px] sm:text-[31px] font-bold tracking-tightest tnum leading-none ${valueTone}`}>
          {value}
        </div>
        {delta != null && (
          <span className={`text-xs font-semibold tnum ${delta >= 0 ? "text-pos" : "text-neg"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}
          </span>
        )}
      </div>
      <div className="mt-2.5 text-[13px] text-ink-muted">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-ink-faint">{sub}</div>}
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/[0.07]" />
    </div>
  );
}
