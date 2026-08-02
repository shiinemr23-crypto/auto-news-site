import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/firebase";

export type Article = {
  id: string;
  title: string;
  rewritten: string;
  source: string;
  link: string;
  image: string | null;
  published?: string;
  createdAt?: string;
};

export type Feature = {
  id: string;
  headline: string;
  body: string;
  topicLabel?: string;
  image: string | null;
  images?: string[];
  slug?: string;
  sources: { name: string; link: string }[];
  createdAt?: string;
};

type FirestoreData = Record<string, unknown>;

function dateValue(value: unknown): string | undefined {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return undefined;
}

function articleFrom(id: string, data: FirestoreData): Article {
  return {
    id,
    title: String(data.title ?? "Untitled story"),
    rewritten: String(data.rewritten ?? ""),
    source: String(data.source ?? "News source"),
    link: String(data.link ?? "#"),
    image: typeof data.image === "string" ? data.image : null,
    published: typeof data.published === "string" ? data.published : undefined,
    createdAt: dateValue(data.created_at),
  };
}

function featureFrom(id: string, data: FirestoreData): Feature {
  const rawSources = Array.isArray(data.sources) ? data.sources : [];
  return {
    id,
    headline: String(data.headline ?? "Featured report"),
    body: String(data.body ?? ""),
    topicLabel: typeof data.topic_label === "string" ? data.topic_label : undefined,
    image: typeof data.image === "string" ? data.image : null,
    images: Array.isArray(data.images) ? data.images.filter((item): item is string => typeof item === "string") : [],
    slug: typeof data.slug === "string" ? data.slug : undefined,
    sources: rawSources.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const source = item as Record<string, unknown>;
      return typeof source.name === "string" && typeof source.link === "string"
        ? [{ name: source.name, link: source.link }]
        : [];
    }),
    createdAt: dateValue(data.created_at),
  };
}

async function fetchLatestArticles(max = 24): Promise<Article[]> {
  const snapshot = await getDocs(query(collection(db, "articles"), orderBy("created_at", "desc"), limit(max)));
  return snapshot.docs.map((item) => articleFrom(item.id, item.data()));
}

async function fetchFeatures(max = 24): Promise<Feature[]> {
  const snapshot = await getDocs(query(collection(db, "featured_articles"), orderBy("created_at", "desc"), limit(max)));
  return snapshot.docs.map((item) => featureFrom(item.id, item.data()));
}

async function fetchArticle(id: string): Promise<Article | null> {
  const snapshot = await getDoc(doc(db, "articles", id));
  return snapshot.exists() ? articleFrom(snapshot.id, snapshot.data()) : null;
}

async function fetchFeature(idOrSlug: string): Promise<Feature | null> {
  const direct = await getDoc(doc(db, "featured_articles", idOrSlug));
  if (direct.exists()) return featureFrom(direct.id, direct.data());
  const bySlug = await getDocs(query(collection(db, "featured_articles"), where("slug", "==", idOrSlug), limit(1)));
  const match = bySlug.docs[0];
  return match ? featureFrom(match.id, match.data()) : null;
}

// A detail page and its metadata often request the same document during one
// server render. This keeps that to one Firestore read per request.
const cached = <T>(key: string[], read: () => Promise<T>) => unstable_cache(read, key, { revalidate: 60 })();

// Keep the response fresh enough for a news site while avoiding a slow remote
// Firestore round trip on every page visit.
export const getLatestArticles = cache((max = 24) => cached(["articles", String(max)], () => fetchLatestArticles(max)));
export const getFeatures = cache((max = 24) => cached(["features", String(max)], () => fetchFeatures(max)));
export const getArticle = cache((id: string) => cached(["article", id], () => fetchArticle(id)));
export const getFeature = cache((idOrSlug: string) => cached(["feature", idOrSlug], () => fetchFeature(idOrSlug)));

export function excerpt(text: string, length = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > length ? `${cleaned.slice(0, length - 1).trimEnd()}…` : cleaned;
}

export function displayDate(date?: string): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

export function timeAgo(date?: string): string | null {
  if (!date) return null;
  const elapsed = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
