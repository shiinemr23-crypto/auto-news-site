import { getFeatures, getLatestArticles } from "@/lib/content";

export const dynamic = "force-dynamic";
const escape = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://signal-desk.vercel.app";
  const [articles, features] = await Promise.all([getLatestArticles(20), getFeatures(10)]);
  const items = [
    ...articles.map((story) => ({ title: story.title, description: story.rewritten, url: `${base}/article/${story.id}`, date: story.createdAt })),
    ...features.map((story) => ({ title: story.headline, description: story.body, url: `${base}/featured/${story.slug ?? story.id}`, date: story.createdAt })),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 30);
  const body = items.map((item) => `<item><title>${escape(item.title)}</title><link>${escape(item.url)}</link><guid>${escape(item.url)}</guid><description>${escape(item.description)}</description>${item.date ? `<pubDate>${new Date(item.date).toUTCString()}</pubDate>` : ""}</item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Signal Desk</title><link>${escape(base)}</link><description>AI-assisted summaries and multi-source global news briefings.</description>${body}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
