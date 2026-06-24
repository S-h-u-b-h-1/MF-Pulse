// MF Pulse — premium fintech dashboard. Server component reading live Supabase views.
import { sb } from "./lib/supabase";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Search from "./components/Search";
import Tracker from "./components/Tracker";
import Watchlist from "./components/Watchlist";
import FlowChart from "./components/FlowChart";
import AlertSignup from "./components/AlertSignup";
import SectionHeader from "./components/ui/SectionHeader";
import MetricCard from "./components/ui/MetricCard";
import SignalCard from "./components/ui/SignalCard";
import AMCCard from "./components/ui/AMCCard";
import GlassPanel from "./components/ui/GlassPanel";
import Badge, { EmptyState } from "./components/ui/Badge";
import trendData from "./data/amc_trend.json";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const inr = (n) => `${n >= 0 ? "+" : "−"}₹${fmt(Math.abs(Math.round(n)))} Cr`;
const lakhCr = (n) => `₹${(n / 100000).toFixed(2)}L Cr`;
const CLASS_COLOR = { Equity: "#34d399", Debt: "#60a5fa", Hybrid: "#a78bfa", Other: "#fbbf24", Solution: "#f472b6" };

function marketIndex() {
  const byDate = {};
  for (const pts of Object.values(trendData.amcs)) for (const [d, v] of pts) (byDate[d] ||= []).push(v);
  return Object.entries(byDate)
    .map(([d, a]) => [d.slice(5), Math.round((a.reduce((s, x) => s + x, 0) / a.length) * 100) / 100])
    .sort((x, y) => (x[0] < y[0] ? -1 : 1));
}

export default async function Page() {
  const [byClass, amcRows, headline, amcFlows, signals] = await Promise.all([
    sb("v_asset_class_summary?select=*"),
    sb("v_amc_summary?select=*&asset_class=eq.Equity&order=schemes.desc&limit=12"),
    sb("v_flow_headline?select=*"),
    sb("v_amc_flows?select=amc_name,asset_class,net_flow_cr&order=net_flow_cr.desc&limit=10"),
    sb("v_signals?select=*&limit=6"),
  ]);
  const flow = headline[0] || {};
  const totalSchemes = byClass.reduce((s, r) => s + Number(r.schemes), 0);
  const maxClass = Math.max(...byClass.map((r) => Number(r.schemes)));
  const latest = byClass.map((r) => r.latest_nav_date).sort().at(-1);
  const series = marketIndex();
  const idxChange = series.length ? series[series.length - 1][1] - series[0][1] : 0;

  const stats = [
    { value: fmt(totalSchemes), label: "Schemes tracked" },
    { value: "51", label: "AMC houses" },
    { value: byClass.length, label: "Asset classes" },
    { value: `${idxChange >= 0 ? "+" : ""}${idxChange.toFixed(1)}`, label: "30d equity index" },
  ];

  return (
    <>
      <Nav active="/" />
      <Tracker event="page_view" payload={{ page: "home" }} />
      <Hero stats={stats} latest={latest} />

      <main className="container-px pb-4">
        {/* Headline flows */}
        <section className="mt-10">
          <SectionHeader
            eyebrow={`Net flows · ${flow.month || "—"}`}
            title="Where India's mutual-fund money moved"
            action={<Badge tone="warn" title="SEBI/AMFI monthly flow report is PDF-only; these are seeded sample figures until the monthly export is wired in.">Sample flows</Badge>}
          />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <MetricCard value={inr(flow.equity_net_cr ?? 0)} label="Equity net inflow" tone="pos" style={{ animationDelay: "0ms" }} />
            <MetricCard value={inr(flow.debt_net_cr ?? 0)} label="Debt net flow" tone="neg" style={{ animationDelay: "70ms" }} />
            <MetricCard value={lakhCr(flow.total_aum_cr ?? 0)} label="Total AUM · reporting AMCs" tone="neutral" style={{ animationDelay: "140ms" }} />
          </div>
        </section>

        {/* Search */}
        <section className="mt-8"><Search /></section>

        {/* 30-day index */}
        <section className="mt-9">
          <SectionHeader
            eyebrow="Real AMFI NAV history"
            title="30-day equity index · all AMCs · normalised to 100"
            action={<span className={idxChange >= 0 ? "text-pos font-bold" : "text-neg font-bold"}>{idxChange >= 0 ? "▲" : "▼"} {idxChange.toFixed(2)}</span>}
          />
          <GlassPanel className="p-5 sm:p-6"><FlowChart series={series} /></GlassPanel>
        </section>

        {/* Signals */}
        <section className="mt-9">
          <SectionHeader eyebrow="z-score ≥ 1.8 vs trailing" title={`⚡ Flow signals · ${flow.month || "—"}`} />
          {signals.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {signals.map((s, i) => (
                <SignalCard key={i} amc={s.amc_name.replace(" Mutual Fund", "")} assetClass={s.asset_class} signal={s.signal} z={Number(s.z_score).toFixed(1)} value={inr(s.net_flow_cr)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No active signals" hint="Surges appear here when monthly flows deviate from trend." />
          )}
        </section>

        <Watchlist />

        {/* AMC net flows */}
        <section className="mt-9">
          <SectionHeader eyebrow="tap to drill down" title={`AMC net flows · ${flow.month || "—"}`} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amcFlows.map((r) => (
              <AMCCard key={r.amc_name + r.asset_class} name={r.amc_name.replace(" Mutual Fund", "")} href={`/amc/${encodeURIComponent(r.amc_name)}`} secondary={r.asset_class} primary={inr(r.net_flow_cr)} tone={Number(r.net_flow_cr) >= 0 ? "pos" : "neg"} />
            ))}
          </div>
        </section>

        {/* Universe */}
        <section className="mt-9">
          <SectionHeader eyebrow="Live · AMFI" title="Universe by asset class" />
          <GlassPanel className="p-5 sm:p-6">
            {byClass.map((r) => (
              <div key={r.asset_class} className="flex items-center gap-4 py-2.5">
                <span className="w-20 text-[13px] text-ink-muted">{r.asset_class}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <span className="block h-full rounded-full" style={{ width: `${(Number(r.schemes) / maxClass) * 100}%`, background: CLASS_COLOR[r.asset_class] || "#64748b" }} />
                </span>
                <span className="w-14 text-right text-[13px] font-semibold tnum">{fmt(r.schemes)}</span>
              </div>
            ))}
          </GlassPanel>
        </section>

        {/* Explore AMCs */}
        <section id="explore" className="mt-9 scroll-mt-20">
          <SectionHeader eyebrow="tap to drill down" title="Top AMCs by equity schemes" action={<a href="/compare" className="hover:text-ink">Compare →</a>} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amcRows.map((r) => (
              <AMCCard key={r.amc_name} name={r.amc_name.replace(" Mutual Fund", "")} href={`/amc/${encodeURIComponent(r.amc_name)}`} secondary="Equity schemes" primary={fmt(r.schemes)} tone="muted" />
            ))}
          </div>
        </section>

        <AlertSignup />
      </main>

      <Footer
        note={
          <span>
            Scheme &amp; NAV data is <b className="text-ink-muted">live from AMFI</b> ({fmt(totalSchemes)} schemes, 51 AMCs, nightly).
            Net-flow figures are <b className="text-warn">sample</b> until the SEBI monthly export is wired in.
          </span>
        }
      />
    </>
  );
}
