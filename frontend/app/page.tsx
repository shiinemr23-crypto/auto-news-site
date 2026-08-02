import Link from "next/link";
import { getFeatures, getLatestArticles } from "@/lib/content";
import { StoryCard, StoryImage } from "@/components/story-card";
import { LoadMore } from "@/components/load-more";
import { MostRead } from "@/components/client-controls";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, features] = await Promise.all([getLatestArticles(20), getFeatures(6)]);
  const hero = articles[0];
  const sideStories = articles.slice(1, 3);
  const trending = articles.slice(3, 8);
  const latest = articles.slice(8);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = latest.filter((article) => article.createdAt && new Date(article.createdAt) >= todayStart);
  const thisWeek = latest.filter((article) => !article.createdAt || new Date(article.createdAt) < todayStart);
  return <div className="page-wrap home-page">
    <section className="home-intro"><p className="kicker">The global report, distilled</p><h1>Know what matters.<br /><em>Move with clarity.</em></h1></section>
    {hero ? <section className="hero-grid"><article className="hero-story"><StoryImage story={hero} priority /><div className="hero-overlay"><p className="eyebrow">{hero.source}</p><h2><Link href={`/article/${hero.id}`}>{hero.title}</Link></h2><p>{hero.rewritten.slice(0, 175)}{hero.rewritten.length > 175 ? "…" : ""}</p></div></article><div className="side-stories">{sideStories.map((story) => <StoryCard story={story} key={story.id} />)}</div></section> : <section className="empty-state"><h2>News is on its way</h2><p>Signal Desk is waiting for the first newsroom updates.</p></section>}
    <section className="section-head spotlight-head"><p className="eyebrow">Across the wires</p><h2>Spotlight</h2><Link href="/featured">All briefings <span>→</span></Link></section>
    {features.length ? <section className="spotlight-gallery">{features.slice(0, 4).map((feature) => <StoryCard story={feature} featured key={feature.id} />)}</section> : <p className="quiet-note">Multi-source featured briefings will appear here as major stories develop.</p>}
    <section className="feed-layout"><div className="latest-column"><section className="section-head latest-head"><p className="eyebrow">Latest dispatches</p><h2>The newsfeed</h2></section>{today.length > 0 && <NewsGroup label="Today" stories={today} />}{thisWeek.length > 0 && <section className="news-group"><h3>This week</h3><LoadMore initial={thisWeek} /></section>}{latest.length === 0 && <p className="quiet-note">New stories will appear here as they arrive.</p>}</div><aside className="trending-sidebar"><p className="eyebrow">Trending now</p><h2>On the radar</h2>{trending.map((story, index) => <Link className="trending-story" href={`/article/${story.id}`} key={story.id}><span>0{index + 1}</span><div><p>{story.source}</p><h3>{story.title}</h3></div></Link>)}<MostRead stories={trending.map((story) => ({ id: story.id, kind: "article", title: story.title, source: story.source, image: story.image }))} /></aside></section>
  </div>;
}

function NewsGroup({ label, stories }: { label: string; stories: Awaited<ReturnType<typeof getLatestArticles>> }) {
  return <section className="news-group"><h3>{label}</h3><div className="article-grid">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div></section>;
}
