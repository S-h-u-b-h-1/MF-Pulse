export default function Badge({ children, tone = "warn", title, dot }) {
  const tones = {
    warn: "text-warn bg-warn/10 border-warn/30",
    pos: "text-pos bg-pos/10 border-pos/30",
    neg: "text-neg bg-neg/10 border-neg/30",
    accent: "text-accent-soft bg-accent/10 border-accent/30",
    neutral: "text-ink-muted bg-white/[0.05] border-line",
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tones[tone]} ${title ? "cursor-help" : ""}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function EmptyState({ icon = "✦", title, hint }) {
  return (
    <div className="glass p-8 text-center">
      <div className="text-2xl text-ink-faint mb-2">{icon}</div>
      <div className="text-sm font-medium text-ink">{title}</div>
      {hint && <div className="text-[12px] text-ink-muted mt-1">{hint}</div>}
    </div>
  );
}
