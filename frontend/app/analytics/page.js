import { sb } from "../lib/supabase";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SectionHeader from "../components/ui/SectionHeader";
import MetricCard from "../components/ui/MetricCard";
import GlassPanel from "../components/ui/GlassPanel";
import { EmptyState } from "../components/ui/Badge";

export const metadata = { title: "Product analytics" };
export const revalidate = 120;

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const LABELS = {
  page_view: "Page views",
  search: "Searches",
  search_click: "Search clicks",
  amc_view: "AMC views",
  watchlist_add: "Watchlist adds",
  watchlist_remove: "Watchlist removes",
  alert_signup: "Alert sign-ups",
};

export default async function Analytics() {
  let events = [], searches = [];
  try {
    [events, searches] = await Promise.all([
      sb("v_event_summary?select=*", { revalidate: 120 }),
      sb("v_top_searches?select=*", { revalidate: 120 }),
    ]);
  } catch {}

  const totalEvents = events.reduce((s, e) => s + Number(e.events), 0);
  const maxEvents = Math.max(...events.map((e) => Number(e.events)), 1);
  const totalSessions = events.reduce((s, e) => Math.max(s, Number(e.sessions) || 0), 0);

  return (
    <>
      <Nav active="/analytics" />
      <main className="container-px py-10">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tightest text-ink">Product analytics</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Live behavioural data from real visitors — searches, drill-downs, watchlist actions and
          sign-ups. Aggregated only; no personal data is exposed.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          <MetricCard value={fmt(totalEvents)} label="Total events" />
          <MetricCard value={fmt(totalSessions)} label="Peak sessions / type" tone="pos" />
          <MetricCard value={events.length} label="Event types" />
        </div>

        <section className="mt-9">
          <SectionHeader eyebrow="user_events" title="Events by type" />
          {events.length ? (
            <GlassPanel className="p-5 sm:p-6">
              {events.map((e) => (
                <div key={e.event_type} className="flex items-center gap-4 py-2.5">
                  <span className="w-32 truncate text-[13px] text-ink-muted">{LABELS[e.event_type] || e.event_type}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <span className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-soft" style={{ width: `${(Number(e.events) / maxEvents) * 100}%` }} />
                  </span>
                  <span className="w-16 text-right text-[13px] font-semibold tnum">{fmt(e.events)}</span>
                </div>
              ))}
            </GlassPanel>
          ) : (
            <EmptyState title="No events yet" hint="Interactions show up here as visitors use the site." />
          )}
        </section>

        <section className="mt-9">
          <SectionHeader eyebrow="intent signal" title="Top searches" />
          {searches.length ? (
            <div className="flex flex-wrap gap-2.5">
              {searches.map((s) => (
                <span key={s.query} className="glass flex items-center gap-2 px-4 py-2.5 text-[13px]">
                  {s.query}
                  <b className="tnum text-accent-soft">{s.searches}</b>
                </span>
              ))}
            </div>
          ) : (
            <EmptyState title="No searches yet" hint="Search the dashboard and they'll rank here." />
          )}
        </section>
      </main>
      <Footer note={<span>The behavioural dataset that turns this from a weekend project into a portfolio piece.</span>} />
    </>
  );
}
