import { getFeatures } from "@/lib/content";
import { StoryCard } from "@/components/story-card";
export const dynamic = "force-dynamic";
export default async function FeaturedPage() { const features = await getFeatures(); return <div className="page-wrap listing-page"><div className="listing-head"><p className="kicker">Beyond the headline</p><h1>Featured briefings</h1><p>Long-form, multi-source views of stories shaping the day.</p></div>{features.length ? <section className="feature-list">{features.map((feature) => <StoryCard story={feature} featured key={feature.id} />)}</section> : <div className="empty-state"><h2>No featured briefings yet</h2><p>Check back soon for our first multi-source report.</p></div>}</div>; }
