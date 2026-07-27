import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://strike-iq-black.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/forgot-password"],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/(dashboard)/",
          "/(admin)/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
