import { sb } from "../lib/supabase";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GlassPanel from "../components/ui/GlassPanel";

export const metadata = { title: "System status" };
export const revalidate = 300;

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

function daysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr + "T00:00:00Z");
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export default async function Status() {
  let byClass = [], headline = [], signals = [], ok = true;
  try {
    [byClass, headline, signals] = await Promise.all([
      sb("mv_asset_class_summary?select=*", { revalidate: 300 }),
      sb("v_flow_headline?select=*", { revalidate: 300 }),
      sb("v_signals?select=z_score", { revalidate: 300 }),
    ]);
  } catch {
    ok = false;
  }

  const totalSchemes = byClass.reduce((s, r) => s + Number(r.schemes), 0);
  const latest = byClass.map((r) => r.latest_nav_date).sort().at(-1);
  const stale = daysSince(latest);
  const checks = [
    { label: "Data API (Supabase / PostgREST)", ok, detail: ok ? "reachable" : "unreachable" },
    { label: "NAV freshness", ok: stale <= 5, detail: latest ? `latest ${latest} (${stale}d ago)` : "no data" },
    { label: "Scheme coverage", ok: totalSchemes >= 8000, detail: `${fmt(totalSchemes)} schemes` },
    { label: "Flow signals", ok: true, detail: `${signals.length} active` },
  ];
  const allGood = checks.every((c) => c.ok);

  return (
    <>
      <Nav active="/status" />
      <main className="container-px py-10">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tightest text-ink">System status</h1>
        <div className={`mt-2 flex items-center gap-2 text-[14px] font-medium ${allGood ? "text-pos" : "text-neg"}`}>
          <span className="h-2 w-2 rounded-full bg-current animate-ring" />
          {allGood ? "All systems operational" : "Degraded — see below"}
        </div>

        <GlassPanel className="mt-7 divide-y divide-line px-5 sm:px-6">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3 py-4 text-[13.5px]">
              <span>{c.ok ? "✅" : "⚠️"}</span>
              <span className="flex-1 text-ink">{c.label}</span>
              <span className="tnum text-ink-muted">{c.detail}</span>
            </div>
          ))}
        </GlassPanel>
      </main>
      <Footer note={<span>Flow headline month: {headline[0]?.month || "—"} · auto-refreshes every 5 min.</span>} />
    </>
  );
}
