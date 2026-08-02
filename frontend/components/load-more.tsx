"use client";

import { collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { StoryCard } from "@/components/story-card";
import type { Article } from "@/lib/content";

function asArticle(id: string, data: Record<string, unknown>): Article { const created = data.created_at as { toDate?: () => Date } | undefined; return { id, title: String(data.title ?? "Untitled story"), rewritten: String(data.rewritten ?? ""), source: String(data.source ?? "News source"), link: String(data.link ?? "#"), image: typeof data.image === "string" ? data.image : null, published: typeof data.published === "string" ? data.published : undefined, createdAt: created?.toDate?.().toISOString() }; }

export function LoadMore({ initial }: { initial: Article[] }) {
  const [stories, setStories] = useState(initial); const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);
  async function more() { const last = stories.at(-1)?.createdAt; if (!last) return setDone(true); setLoading(true); try { const result = await getDocs(query(collection(db, "articles"), where("created_at", "<", Timestamp.fromDate(new Date(last))), orderBy("created_at", "desc"), limit(9))); const next = result.docs.map((item) => asArticle(item.id, item.data())); setStories((current) => [...current, ...next]); setDone(next.length < 9); } finally { setLoading(false); } }
  return <section className="load-more-area"><div className="article-grid">{stories.map((story) => <StoryCard story={story} key={story.id} />)}</div>{!done && <button className="load-more" onClick={() => void more()} disabled={loading}>{loading ? "Loading stories…" : "Load more stories"}</button>}</section>;
}
