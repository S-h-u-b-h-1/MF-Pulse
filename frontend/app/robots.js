const SITE = "https://frontend-six-beta-20.vercel.app";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
