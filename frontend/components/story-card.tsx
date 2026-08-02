import Link from "next/link";
import { timeAgo, type Article, type Feature } from "@/lib/content";

type Story = Article | Feature;

function isFeature(story: Story): story is Feature { return "headline" in story; }

export function StoryImage({ story, priority = false }: { story: Story; priority?: boolean }) {
  const title = isFeature(story) ? story.headline : story.title;
  const image = story.image ?? (isFeature(story) ? story.images?.[0] : null);
  return image ? <img className="story-image" src={image} alt="" loading={priority ? "eager" : "lazy"} /> : <div className="image-fallback" aria-label={`No image available for ${title}`}><span>Signal<br />Desk</span></div>;
}

export function StoryCard({ story, featured = false }: { story: Story; featured?: boolean }) {
  const feature = isFeature(story);
  const title = feature ? story.headline : story.title;
  const href = feature ? `/featured/${story.slug ?? story.id}` : `/article/${story.id}`;
  const age = timeAgo(story.createdAt);
  return <article className={`story-card ${featured ? "feature-card" : ""}`}><Link className="card-image" href={href}><StoryImage story={story} /></Link><div className="card-copy"><p className="eyebrow">{feature ? "Deep Dive" : story.source}{age && <span className="story-age"> · {age}</span>}</p><h3><Link href={href}>{title}</Link></h3></div></article>;
}
