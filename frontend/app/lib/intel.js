// Analyst-grade market intelligence computed from the REAL 30-day equity index
// (AMFI NAV history). No sample data. Pure function — runs server-side.
const strip = (s) => s.replace(" Mutual Fund", "");

export function marketIntel(amcs) {
  const rows = Object.entries(amcs).map(([name, pts]) => ({
    name: strip(name),
    amc: name,
    change: pts[pts.length - 1][1] - pts[0][1],
  }));
  const changes = rows.map((r) => r.change);
  const n = changes.length || 1;
  const avg = changes.reduce((a, b) => a + b, 0) / n;
  const positive = changes.filter((c) => c > 0).length;
  const stdev = Math.sqrt(changes.reduce((a, c) => a + (c - avg) ** 2, 0) / n);
  const sorted = [...rows].sort((a, b) => b.change - a.change);
  return {
    n,
    avg,
    breadth: positive / n,
    positive,
    stdev,
    dispersion: Math.max(...changes) - Math.min(...changes),
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  };
}
