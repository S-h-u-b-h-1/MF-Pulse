import HeroBackground from "./HeroBackground";
import PremiumButton from "./ui/PremiumButton";
import StatCard from "./ui/StatCard";

export default function Hero({ stats, latest }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <HeroBackground />
      <div className="container-px relative pt-14 pb-12 sm:pt-24 sm:pb-16">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3 py-1 text-[12px] text-ink-muted animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-pos animate-ring" /> Live · AMFI · {latest}
        </div>

        <h1
          className="mt-5 max-w-3xl text-[33px] leading-[1.05] sm:text-[52px] font-bold tracking-tightest text-ink animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          India&rsquo;s Mutual Fund{" "}
          <span className="bg-gradient-to-r from-accent-soft to-pos bg-clip-text text-transparent">
            Flow Intelligence
          </span>{" "}
          Platform
        </h1>

        <p
          className="mt-5 max-w-2xl text-[15px] sm:text-[17px] leading-relaxed text-ink-muted animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Track AMC-level inflows and outflows, category trends, real-time flow signals, and investor
          behaviour — built on free public AMFI &amp; SEBI data, refreshed nightly.
        </p>

        <div className="mt-7 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: "180ms" }}>
          <PremiumButton href="#explore">Explore AMCs →</PremiumButton>
          <PremiumButton href="#alerts" variant="ghost">Get Flow Alerts</PremiumButton>
        </div>

        <div
          className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          {stats.map((s) => (
            <StatCard key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
