import trendData from "./data/amc_trend.json";

const SITE = "https://frontend-six-beta-20.vercel.app";

export default function sitemap() {
  const amcs = Object.keys(trendData.amcs).map((a) => ({
    url: `${SITE}/amc/${encodeURIComponent(a)}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));
  return [{ url: SITE, changeFrequency: "daily", priority: 1 }, ...amcs];
}
