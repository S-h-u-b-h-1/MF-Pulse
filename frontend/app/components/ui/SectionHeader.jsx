export default function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1.5">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[15px] sm:text-base font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      {action && <div className="shrink-0 text-[12px] text-ink-faint">{action}</div>}
    </div>
  );
}
