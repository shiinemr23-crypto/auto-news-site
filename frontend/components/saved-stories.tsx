"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSavedStories } from "@/components/client-controls";

type Saved = ReturnType<typeof getSavedStories>[number];
export function SavedStories() { const [stories, setStories] = useState<Saved[]>([]); useEffect(() => { const refresh = () => setStories(getSavedStories()); refresh(); window.addEventListener("signal-desk-saved", refresh); return () => window.removeEventListener("signal-desk-saved", refresh); }, []); if (!stories.length) return <div className="empty-state"><h2>No saved stories yet</h2><p>Use “Save story” on an article or featured briefing to keep it here on this browser.</p></div>; return <div className="saved-list">{stories.map((story) => <Link href={story.kind === "featured" ? `/featured/${story.slug ?? story.id}` : `/article/${story.id}`} key={`${story.kind}-${story.id}`}><span>{story.kind === "featured" ? "Featured briefing" : story.source ?? "News story"}</span><h2>{story.title}</h2></Link>)}</div>; }
