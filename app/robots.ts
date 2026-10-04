import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api/"] },
    ],
    sitemap: "https://odiadesk.com/sitemap.xml",
  };
}
