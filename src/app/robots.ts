import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/login",
          "/signup",
          "/confirm",
          "/verify-email",
          "/forgot-password",
          "/reset-password",
          "/ingest/",
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://packwell.io"}/sitemap.xml`,
  };
}
