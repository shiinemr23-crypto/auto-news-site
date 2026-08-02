"use client";

import { useEffect, useState } from "react";

type SavedStory = { id: string; kind: "article" | "featured"; title: string; source?: string; image?: string | null; slug?: string };
const SAVED_KEY = "signal-desk-saved";
const READ_KEY = "signal-desk-read-counts";

function readSaved(): SavedStory[] { try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; } }
export function getSavedStories(): SavedStory[] { return typeof window === "undefined" ? [] : readSaved(); }

export function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("signal-desk-theme"); setLight(saved === "light"); document.body.dataset.theme = saved === "light" ? "light" : "dark"; }, []);
  function toggle() { const next = !light; setLight(next); document.body.dataset.theme = next ? "light" : "dark"; localStorage.setItem("signal-desk-theme", next ? "light" : "dark"); }
  return <button className="icon-button" onClick={toggle} aria-label={`Switch to ${light ? "dark" : "light"} theme`} title="Toggle theme">{light ? "◐" : "☼"}</button>;
}

export function BookmarkButton({ story }: { story: SavedStory }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readSaved().some((item) => item.id === story.id && item.kind === story.kind)), [story.id, story.kind]);
  function toggle() { const current = readSaved(); const exists = current.some((item) => item.id === story.id && item.kind === story.kind); localStorage.setItem(SAVED_KEY, JSON.stringify(exists ? current.filter((item) => !(item.id === story.id && item.kind === story.kind)) : [story, ...current])); setSaved(!exists); window.dispatchEvent(new Event("signal-desk-saved")); }
  return <button className={`action-button ${saved ? "is-saved" : ""}`} onClick={toggle} aria-pressed={saved}>{saved ? "Saved" : "Save story"} <span>{saved ? "✓" : "＋"}</span></button>;
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() { const data = { title, url: window.location.href }; if (navigator.share) { await navigator.share(data); return; } await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return <button className="action-button" onClick={() => { void share(); }}>{copied ? "Link copied" : "Share"} <span>↗</span></button>;
}

export function TrackStoryView({ id }: { id: string }) { useEffect(() => { try { const counts = JSON.parse(sessionStorage.getItem(READ_KEY) ?? "{}"); counts[id] = (counts[id] ?? 0) + 1; sessionStorage.setItem(READ_KEY, JSON.stringify(counts)); } catch { /* local browsing enhancement only */ } }, [id]); return null; }

export function MostRead({ stories }: { stories: SavedStory[] }) {
  const [ranked, setRanked] = useState<SavedStory[]>(stories.slice(0, 4));
  useEffect(() => { try { const counts = JSON.parse(sessionStorage.getItem(READ_KEY) ?? "{}"); setRanked([...stories].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)).slice(0, 4)); } catch { /* use server order */ } }, [stories]);
  return <section className="most-read" aria-label="Most read"><p className="eyebrow">Your session</p><h2>Most read</h2>{ranked.map((story, index) => <a href={story.kind === "featured" ? `/featured/${story.slug ?? story.id}` : `/article/${story.id}`} key={story.id}><span>0{index + 1}</span><strong>{story.title}</strong></a>)}</section>;
}
