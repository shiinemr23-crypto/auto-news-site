import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { displayDate, excerpt, getArticle } from "@/lib/content";
import { StoryImage } from "@/components/story-card";

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
  return <article className="reading-page page-wrap"><div className="reading-head"><p className="eyebrow">{article.source}</p><h1>{article.title}</h1>{displayDate(article.createdAt) && <p className="date">Published {displayDate(article.createdAt)}</p>}</div><div className="reading-image"><StoryImage story={article} priority /></div><div className="prose">{article.rewritten.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><a className="source-button" href={article.link} target="_blank" rel="noreferrer">Visit original reporting <span>↗</span></a></article>;
}
