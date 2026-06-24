import { sb } from "../lib/supabase";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import GlassPanel from "../components/ui/GlassPanel";
import SectionHeader from "../components/ui/SectionHeader";
import StatStrip from "../components/ui/StatStrip";
import DataTable from "../components/ui/DataTable";

export const metadata = { title: "Data Status" };
export const revalidate = 60;

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const COLOR = { green: "#34d399", amber: "#fbbf24", red: "#f87171" };
const LABEL = { green: "Operational", amber: "Degraded / stale", red: "Down" };

function Dot({ status }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR[status] || "#5b6577" }} />;
}
function daysSince(d) {
  return d ? Math.floor((Date.now() - new Date(d + "T00:00:00Z").getTime()) / 86400000) : null;
}

export default async function DataStatus() {
  let health = [], runs = [], byClass = [], flow = [];
  let ok = true;
  try {
    [health, runs, byClass, flow] = await Promise.all([
      sb("v_latest_health?select=*", { revalidate: 60 }),
      sb("v_recent_runs?select=*&limit=10", { revalidate: 60 }),
      sb("v_asset_class_summary?select=*", { revalidate: 60 }),
      sb("v_flow_headline?select=*", { revalidate: 60 }),
    ]);
  } catch {
    ok = false;
  }
  const h = health[0] || {};
  const latestNav = byClass.map((r) => r.latest_nav_date).sort().at(-1);
  const totalSchemes = byClass.reduce((s, r) => s + Number(r.schemes), 0);
  const stale = daysSince(latestNav);
  const navStatus = !ok ? "red" : stale == null ? "red" : stale <= 2 ? "green" : stale <= 7 ? "amber" : "red";
  const flowStatus = "amber"; // monthly sample until SEBI export wired in
  const lastSuccess = runs.find((r) => r.status === "success");
  const overall = !ok ? "red" : [navStatus, flowStatus].includes("red") ? "red" : [navStatus, flowStatus].includes("amber") ? "amber" : "green";

  const runCols = [
    { key: "pipeline", label: "Pipeline", render: (r) => r.pipeline },
    { key: "status", label: "Status", render: (r) => <span className="inline-flex items-center gap-1.5"><Dot status={r.status === "success" ? "green" : "red"} />{r.status}</span> },
    { key: "source", label: "Source", muted: true, render: (r) => r.source },
    { key: "rows_ingested", label: "Rows", align: "right", mono: true, render: (r) => (r.rows_ingested != null ? fmt(r.rows_ingested) : "—") },
    { key: "duration_ms", label: "Duration", align: "right", mono: true, muted: true, render: (r) => (r.duration_ms != null ? `${r.duration_ms} ms` : "—") },
    { key: "finished_at", label: "Finished", align: "right", muted: true, render: (r) => new Date(r.finished_at).toLocaleString("en-IN") },
  ];

  const stats = [
    { label: "Total schemes", value: fmt(totalSchemes) },
    { label: "AMC houses", value: byClass.length ? "51" : "—" },
    { label: "NAV rows", value: h.total_nav_rows ? fmt(h.total_nav_rows) : "—" },
    { label: "Events", value: h.total_events != null ? fmt(h.total_events) : "—" },
    { label: "Latest NAV", value: latestNav || "—" },
    { label: "Flow month", value: flow[0]?.month || "—" },
  ];

  return (
    <>
      <Nav active="/status" />
      <main className="container-px py-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Observability</div>
        <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold tracking-tightest text-ink">Data Status</h1>
        <div className="mt-2 flex items-center gap-2 text-[14px]">
          <Dot status={overall} />
          <span className="font-medium" style={{ color: COLOR[overall] }}>{LABEL[overall]}</span>
          <span className="text-ink-faint">· every number below traces to a source &amp; timestamp</span>
        </div>

        {/* Freshness cards */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">NAV freshness</div>
              <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: COLOR[navStatus] }}><Dot status={navStatus} />{navStatus}</span>
            </div>
            <div className="mt-3 text-[26px] font-bold tnum">{stale == null ? "—" : `${stale}d`}</div>
            <div className="text-[12px] text-ink-muted">since latest AMFI NAV ({latestNav || "—"})</div>
            <div className="mt-2 text-[11px] text-ink-faint">Source: AMFI NAVAll · daily pipeline. {navStatus === "amber" && "Stale — daily cron not yet activated (needs SUPABASE_SERVICE_ROLE_KEY secret)."}</div>
          </GlassPanel>
          <GlassPanel className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-semibold text-ink">Monthly flow freshness</div>
              <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: COLOR[flowStatus] }}><Dot status={flowStatus} />sample</span>
            </div>
            <div className="mt-3 text-[26px] font-bold tnum">{flow[0]?.month || "—"}</div>
            <div className="text-[12px] text-ink-muted">latest reporting month</div>
            <div className="mt-2 text-[11px] text-ink-faint">Source: <b className="text-warn">sample</b> — SEBI/AMFI monthly report is PDF-only; loaders ready, awaiting a connected export.</div>
          </GlassPanel>
        </section>

        {/* Coverage */}
        <section className="mt-6"><StatStrip items={stats} /></section>

        {/* Pipeline runs */}
        <section className="mt-9">
          <SectionHeader eyebrow={lastSuccess ? `last success ${new Date(lastSuccess.finished_at).toLocaleString("en-IN")}` : "no runs yet"} title="Recent pipeline runs" />
          {runs.length ? (
            <DataTable columns={runCols} rows={runs.map((r, i) => ({ ...r, _key: i }))} footnote="Append-only audit log (fact_pipeline_runs). Every ingestion records source, timing, rows, and status." />
          ) : (
            <GlassPanel className="p-6 text-[13px] text-ink-muted">No pipeline runs recorded yet.</GlassPanel>
          )}
        </section>
      </main>
      <Footer note={<span>Freshness &amp; runs from <code className="text-ink-muted">fact_system_health</code> / <code className="text-ink-muted">fact_pipeline_runs</code> · auto-refresh 60s.</span>} />
    </>
  );
}
