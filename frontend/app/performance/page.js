import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SectionHeader from "../components/ui/SectionHeader";
import DataTable from "../components/ui/DataTable";
import TrustBar from "../components/ui/TrustBar";
import Badge from "../components/ui/Badge";
import performance from "../data/performance.json";

export const metadata = { title: "Fund Performance" };

const ret = (r) => <span className={r.ret >= 0 ? "text-pos tnum" : "text-neg tnum"}>{r.ret >= 0 ? "+" : ""}{r.ret.toFixed(2)}%</span>;

function table(rows) {
  return rows.map((r, i) => ({ ...r, _key: r.code, _rank: i + 1 }));
}

const cols = [
  { key: "rank", label: "#", muted: true, render: (r) => r._rank },
  { key: "name", label: "Fund", render: (r) => (
    <a className="text-ink hover:text-accent-soft" href={`/amc/${encodeURIComponent(r.amc + " Mutual Fund")}`}>
      <span className="block">{r.name.replace(/ - (Direct|Regular).*/i, "")}</span>
      <span className="text-[11px] text-ink-faint">{r.amc}</span>
    </a>
  ) },
  { key: "nav", label: "NAV ₹", align: "right", mono: true, muted: true, render: (r) => r.nav.toFixed(2) },
  { key: "ret", label: "30d return", align: "right", render: ret },
];

export default function Performance() {
  return (
    <>
      <Nav active="/research" />
      <main className="container-px py-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Research · Performance</div>
        <h1 className="mt-2 text-[28px] sm:text-[34px] font-bold tracking-tightest text-ink">Equity fund performance · 30 days</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          True 30-day NAV returns for {performance.universe.toLocaleString("en-IN")} equity <b className="text-ink">Direct/Growth</b> plans —
          IDCW plans excluded so dividend payouts don&rsquo;t distort returns. Every number is a direct AMFI NAV calculation.
        </p>
        <TrustBar
          asOf={performance.asOf}
          label="AMFI NAV"
          className="mt-3"
          sources={[{ label: "Universe", value: `${performance.universe} funds` }, { label: "Window", value: "30 days" }]}
        />

        <section className="mt-8">
          <SectionHeader eyebrow="real AMFI NAV · no sample" title="Top performers" action={<Badge tone="pos" dot>live data</Badge>} />
          <DataTable columns={cols} rows={table(performance.top)} footnote="30-day NAV return = (latest NAV − NAV 30d ago) / NAV 30d ago. Source: AMFI NAV history." />
        </section>

        <section className="mt-9">
          <SectionHeader eyebrow="real AMFI NAV · no sample" title="Laggards" />
          <DataTable columns={cols} rows={table(performance.bottom)} />
        </section>
      </main>
      <Footer note={<span>Past performance is not indicative of future returns · not investment advice · source <a className="text-ink-muted hover:text-ink" href="https://www.amfiindia.com">AMFI</a>.</span>} />
    </>
  );
}
