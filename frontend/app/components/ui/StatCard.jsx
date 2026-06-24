export default function StatCard({ value, label }) {
  return (
    <div className="glass px-4 py-3.5 text-center transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-lg sm:text-xl font-bold tnum tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted">{label}</div>
    </div>
  );
}
