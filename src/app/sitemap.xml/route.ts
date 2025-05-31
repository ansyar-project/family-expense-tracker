import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://family-expense-tracker.ansyar-world.top";
  // Add more URLs dynamically if needed
  const urls = [
    "",
    "/dashboard/entries",
    "/dashboard",
    // Add more paths here
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `<url>
  <loc>${baseUrl}${path}</loc>
  <changefreq>weekly</changefreq>
  <priority>${path === "" ? "1.0" : "0.8"}</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}