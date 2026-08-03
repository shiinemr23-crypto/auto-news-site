import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { displayDate, excerpt, getArticle, getLatestArticles } from "@/lib/content";
import { StoryCard, StoryImage } from "@/components/story-card";
import { BookmarkButton, ShareButton, TrackStoryView } from "@/components/client-controls";

type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).id);
  if (!article) return {};
  return { title: article.title, description: excerpt(article.rewritten), openGraph: { title: article.title, description: excerpt(article.rewritten), images: article.image ? [article.image] : [] } };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).id);
  if (!article) notFound();
  const related = (await getLatestArticles(8)).filter((item) => item.id !== article.id).slice(0, 3);
  return <article className="reading-page page-wrap"><TrackStoryView id={article.id} /><Link className="back-link" href="/">← Back to latest</Link><div className="reading-head"><p className="eyebrow">{article.source}</p><h1>{article.title}</h1>{displayDate(article.createdAt) && <p className="date">Published {displayDate(article.createdAt)}</p>}<div className="article-actions"><BookmarkButton story={{ id: article.id, kind: "article", title: article.title, source: article.source, image: article.image }} /><ShareButton title={article.title} /></div></div><div className="reading-image"><StoryImage story={article} priority /></div><div className="prose">{article.rewritten.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><a className="source-button" href={article.link} target="_blank" rel="noreferrer">Visit original reporting <span>↗</span></a>{related.length > 0 && <section className="related-stories"><p className="eyebrow">Keep reading</p><h2>Related stories</h2><div>{related.map((item) => <StoryCard story={item} key={item.id} />)}</div></section>}</article>;
}
