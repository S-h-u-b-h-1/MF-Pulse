export default function AMCCard({ name, href, primary, secondary, tone = "muted", onClick }) {
  const toneCls = { pos: "text-pos", neg: "text-neg", muted: "text-ink-muted", accent: "text-accent-soft" }[tone];
  return (
    <a
      href={href}
      onClick={onClick}
      className="group glass p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-line-strong hover:-translate-y-0.5"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink truncate">{name}</div>
        {secondary && <div className="text-[11px] text-ink-faint mt-0.5">{secondary}</div>}
      </div>
      <div className={`text-[13px] font-bold tnum shrink-0 ${toneCls}`}>{primary}</div>
    </a>
  );
}
