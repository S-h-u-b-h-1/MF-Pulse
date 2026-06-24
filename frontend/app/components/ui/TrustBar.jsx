// Trust / provenance signals — sources, freshness, methodology.
// `label` states the accurate freshness mode (e.g. "Latest AMFI NAV", "Live activity").
export default function TrustBar({ asOf, label = "Latest data", sources = [], className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-faint ${className}`}>
      <span className="inline-flex items-center gap-1.5 text-ink-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-pos" />
        {label} · {asOf}
      </span>
      {sources.map((s, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span className="text-ink-faint">{s.label}</span>
          {s.value && <span className="text-ink-muted">{s.value}</span>}
        </span>
      ))}
      <a href="/methodology" className="ml-auto text-ink-muted hover:text-ink">
        Methodology →
      </a>
    </div>
  );
}
