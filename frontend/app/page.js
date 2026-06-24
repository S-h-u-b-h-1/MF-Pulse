// MF Pulse — Market Intelligence homepage. Dense, terminal-grade, trust-signaled.
import { sb } from "./lib/supabase";
import { buildBrief } from "./lib/brief";
import { marketIntel } from "./lib/intel";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Search from "./components/Search";
import Tracker from "./components/Tracker";
import Watchlist from "./components/Watchlist";
import HeroVisual from "./components/HeroVisual";
import FlowHeatmap from "./components/FlowHeatmap";
import AlertSignup from "./components/AlertSignup";
import SectionHeader from "./components/ui/SectionHeader";
import GlassPanel from "./components/ui/GlassPanel";
import StatStrip from "./components/ui/StatStrip";
import TrustBar from "./components/ui/TrustBar";
import Leaderboard from "./components/Leaderboard";
import DataTable from "./components/ui/DataTable";
import SignalCard from "./components/ui/SignalCard";
import PremiumButton from "./components/ui/PremiumButton";
import Badge from "./components/ui/Badge";
import trendData from "./data/amc_trend.json";
import performance from "./data/performance.json";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const inr = (n) => `${n >= 0 ? "+" : "−"}₹${fmt(Math.abs(Math.round(n)))} Cr`;
const lakhCr = (n) => `₹${(n / 100000).toFixed(2)}L Cr`;
const strip = (s) => s.replace(" Mutual Fund", "");
const trendDelta = (amc) => {
  const p = trendData.amcs[amc];
  return p ? p[p.length - 1][1] - p[0][1] : null;
};

export default async function Page() {
  const [byClass, amcSummary, headline, amcFlows, signals, flowHistory] = await Promise.all([
    sb("mv_asset_class_summary?select=*"),
    sb("mv_amc_summary?select=*"),
    sb("v_flow_headline?select=*"),
    sb("v_amc_flows?select=amc_name,asset_class,net_flow_cr"),
    sb("v_signals?select=*"),
    sb("v_flow_history?select=*"),
  ]);
  const flow = headline[0] || {};
  const totalSchemes = byClass.reduce((s, r) => s + Number(r.schemes), 0);
  const latest = byClass.map((r) => r.latest_nav_date).sort().at(-1);
  const brief = buildBrief({ headline: flow, amcFlows, signals });
  const intel = marketIntel(trendData.amcs);
  const amcDeltas = Object.fromEntries(Object.entries(trendData.amcs).map(([k, p]) => [k, p[p.length - 1][1] - p[0][1]]));
  const moverCol = (label) => [
    { key: "name", label, render: (r) => <a className="text-ink hover:text-accent-soft" href={`/amc/${encodeURIComponent(r.amc)}`}>{r.name}</a> },
    { key: "change", label: "30d Δ", align: "right", render: (r) => <span className={r.change >= 0 ? "text-pos tnum" : "text-neg tnum"}>{r.change >= 0 ? "+" : ""}{r.change.toFixed(2)}</span> },
  ];
  const perfCols = [
    { key: "rank", label: "#", muted: true, render: (r) => r._rank },
    { key: "name", label: "Fund", render: (r) => <a className="text-ink hover:text-accent-soft" href={`/amc/${encodeURIComponent(r.amc + " Mutual Fund")}`}>{r.name.replace(/ - (Direct|Regular).*/i, "")}<span className="block text-[11px] text-ink-faint">{r.amc}</span></a> },
    { key: "ret", label: "30d return", align: "right", render: (r) => <span className={r.ret >= 0 ? "text-pos tnum" : "text-neg tnum"}>{r.ret >= 0 ? "+" : ""}{r.ret.toFixed(2)}%</span> },
  ];

  // Per-AMC aggregation for leaderboard
  const agg = {};
  for (const r of amcSummary) {
    const a = (agg[r.amc_name] ||= { total: 0, equity: 0 });
    a.total += Number(r.schemes);
    if (r.asset_class === "Equity") a.equity += Number(r.schemes);
  }
  const flowByAmc = {};
  for (const r of amcFlows) {
    const f = (flowByAmc[r.amc_name] ||= { equity: null, debt: null });
    if (r.asset_class === "Equity") f.equity = Number(r.net_flow_cr);
    if (r.asset_class === "Debt") f.debt = Number(r.net_flow_cr);
  }
  const sigCount = {};
  for (const s of signals) sigCount[s.amc_name] = (sigCount[s.amc_name] || 0) + 1;

  const leaderboard = Object.entries(agg)
    .map(([amc, a]) => {
      const f = flowByAmc[amc] || {};
      const eq = f.equity ?? null, db = f.debt ?? null;
      const total = eq == null && db == null ? null : (eq || 0) + (db || 0);
      return {
        amc, name: strip(amc), equity: a.equity, idx: trendDelta(amc),
        equityFlow: eq, debtFlow: db, totalFlow: total, signals: sigCount[amc] || 0,
      };
    })
    .sort((x, y) => y.equity - x.equity)
    .slice(0, 15);

  // Flow network nodes (AMCs with monthly flow data)
  const netAgg = {};
  for (const r of amcFlows) {
    const a = (netAgg[r.amc_name] ||= { name: strip(r.amc_name), equity: 0, debt: 0 });
    if (r.asset_class === "Equity") a.equity = Number(r.net_flow_cr);
    if (r.asset_class === "Debt") a.debt = Number(r.net_flow_cr);
  }
  const networkNodes = Object.values(netAgg)
    .sort((a, b) => Math.abs(b.equity) + Math.abs(b.debt) - (Math.abs(a.equity) + Math.abs(a.debt)))
    .slice(0, 7);

  // Hero strip leads with REAL, traceable metrics (no synthetic AUM/flows up top).
  const topPerf = performance.top[0];
  const stats = [
    { label: "Schemes tracked", value: fmt(totalSchemes), sub: "AMFI · daily" },
    { label: "AMC houses", value: "51", sub: "AMFI" },
    { label: "Top fund · 30d", value: `+${topPerf.ret.toFixed(1)}%`, tone: "pos", sub: topPerf.amc },
    { label: "Market momentum", value: `${intel.avg >= 0 ? "+" : ""}${intel.avg.toFixed(2)}`, tone: intel.avg >= 0 ? "pos" : "neg", sub: "avg AMC 30d index" },
    { label: "Latest NAV", value: latest, sub: "AMFI" },
    { label: "Flow signals", value: signals.length, sub: "flows · sample" },
  ];

  return (
    <>
      <Nav active="/" />
      <Tracker event="page_view" payload={{ page: "home" }} />

      <main className="container-px py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Market Intelligence · {flow.month || "—"}</div>
            <h1 className="mt-2 text-[26px] sm:text-[34px] font-bold tracking-tightest text-ink">India Mutual-Fund Flow Intelligence</h1>
          </div>
          <div className="flex gap-2">
            <PremiumButton href="/brief" variant="ghost">Market Brief</PremiumButton>
            <PremiumButton href="#alerts">Get Flow Alerts</PremiumButton>
          </div>
        </div>
        <TrustBar asOf={latest} label="Latest AMFI NAV" className="mt-3.5" sources={[{ label: "NAVs", value: "AMFI · daily" }, { label: "Flows", value: "SEBI · sample" }]} />

        {/* Market summary strip */}
        <div className="mt-6"><StatStrip items={stats} /></div>

        {/* Network + brief */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GlassPanel className="lg:col-span-2 p-5 sm:p-6">
            <SectionHeader eyebrow={`net flows · ${flow.month || "—"}`} title="Capital allocation network · AMC → category" action={<Badge tone="warn">sample</Badge>} />
            <HeroVisual nodes={networkNodes} />
          </GlassPanel>
          <GlassPanel className="p-5 sm:p-6">
            <SectionHeader title="Market brief" action={<a className="hover:text-ink" href="/brief">Full →</a>} />
            <p className="text-[13.5px] leading-relaxed text-ink-muted">{brief.lead}</p>
            <ul className="mt-4 space-y-2.5">
              {brief.bullets.map((b, i) => (
                <li key={i} className="flex items-start justify-between gap-3 text-[12.5px]">
                  <span className="text-ink-faint">{b.k}</span>
                  <span className={`text-right ${b.tone === "pos" ? "text-pos" : b.tone === "neg" ? "text-neg" : "text-ink"}`}>{b.v}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>

        {/* Search */}
        <div className="mt-6"><Search /></div>

        {/* Market intelligence — REAL 30-day equity index, no sample */}
        <section className="mt-9">
          <SectionHeader eyebrow="30-day equity index · real AMFI NAV history" title="Market intelligence" action={<Badge tone="pos" dot>live data</Badge>} />
          <StatStrip
            items={[
              { label: "30d momentum", value: `${intel.avg >= 0 ? "+" : ""}${intel.avg.toFixed(2)}`, tone: intel.avg >= 0 ? "pos" : "neg", sub: "avg index Δ" },
              { label: "Breadth", value: `${intel.positive}/${intel.n}`, sub: `${(intel.breadth * 100).toFixed(0)}% positive` },
              { label: "Dispersion", value: intel.dispersion.toFixed(1), sub: "gain−loss range" },
              { label: "Volatility", value: intel.stdev.toFixed(2), sub: "std dev of Δ" },
              { label: "Best", value: `+${intel.gainers[0]?.change.toFixed(1)}`, tone: "pos", sub: intel.gainers[0]?.name },
              { label: "Worst", value: intel.losers[0]?.change.toFixed(1), tone: "neg", sub: intel.losers[0]?.name },
            ]}
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-pos">Top gainers</div>
              <DataTable columns={moverCol("AMC")} rows={intel.gainers.map((r) => ({ ...r, _key: r.amc }))} />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-neg">Top laggards</div>
              <DataTable columns={moverCol("AMC")} rows={intel.losers.map((r) => ({ ...r, _key: r.amc }))} />
            </div>
          </div>
        </section>

        {/* Top performing funds — REAL AMFI NAV returns */}
        <section className="mt-9">
          <SectionHeader eyebrow="real 30-day NAV return · equity Direct/Growth" title="Top performing funds" action={<a className="hover:text-ink" href="/performance">All {performance.universe} →</a>} />
          <DataTable columns={perfCols} rows={performance.top.slice(0, 6).map((r, i) => ({ ...r, _key: r.code, _rank: i + 1 }))} footnote="30-day NAV return, equity Direct/Growth plans. Source: AMFI NAV history." />
        </section>

        {/* Heatmap — clearly-labelled SAMPLE flow data (real flows pending SEBI export) */}
        <section className="mt-9">
          <SectionHeader eyebrow="illustrative sample · awaiting SEBI export" title="Net equity-flow heatmap" action={<Badge tone="warn">sample</Badge>} />
          <GlassPanel className="p-5 sm:p-6"><FlowHeatmap rows={flowHistory} assetClass="Equity" /></GlassPanel>
        </section>

        {/* Signals */}
        {signals.length > 0 && (
          <section className="mt-9">
            <SectionHeader eyebrow="z-score ≥ 1.8" title="Flow signals" action={<a className="hover:text-ink" href="/signals">All →</a>} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {signals.slice(0, 6).map((s, i) => (
                <SignalCard key={i} amc={strip(s.amc_name)} assetClass={s.asset_class} signal={s.signal} z={Number(s.z_score).toFixed(1)} value={inr(s.net_flow_cr)} />
              ))}
            </div>
          </section>
        )}

        {/* AMC leaderboard */}
        <section className="mt-9">
          <SectionHeader eyebrow="sortable · click any header" title="AMC leaderboard" action={<a className="hover:text-ink" href="/compare">Compare →</a>} />
          <Leaderboard rows={leaderboard} />
        </section>

        <Watchlist amcDeltas={amcDeltas} />
        <AlertSignup />
      </main>

      <Footer note={<span><b className="text-ink-muted">Daily NAV intelligence</b> from AMFI — latest available: {latest} ({fmt(totalSchemes)} schemes, 51 AMCs). Monthly net-flow figures are <b className="text-warn">sample data</b> until the SEBI export is wired in. <a className="text-ink-muted hover:text-ink" href="/data-status">Data status →</a></span>} />
    </>
  );
}
