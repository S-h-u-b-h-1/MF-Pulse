import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CompareClient from "../components/CompareClient";
import trendData from "../data/amc_trend.json";

export const metadata = { title: "Compare AMCs" };

export default function Compare() {
  return (
    <>
      <Nav active="/compare" />
      <main className="container-px py-10">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tightest text-ink">Compare AMCs</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-muted">
          Compare AMC equity performance side-by-side over the last 30 days (index normalised to 100,
          from real AMFI NAV history).
        </p>
        <div className="mt-8">
          <CompareClient amcs={trendData.amcs} />
        </div>
      </main>
      <Footer note={<span>30-day equity index from real AMFI NAV history.</span>} />
    </>
  );
}
