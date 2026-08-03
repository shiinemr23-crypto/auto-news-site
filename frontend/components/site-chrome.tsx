import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/client-controls";
import { getLatestArticles } from "@/lib/content";

export async function Header() {
  const breaking = (await getLatestArticles(1))[0];
  return <header className="site-header"><a className="skip-link" href="#main-content">Skip to content</a><div className="masthead"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M7 14h10l9 32 8-20h8l8 20 8-32h10L55 54H45l-7-19-7 19H21z" fill="currentColor"/><path d="M18 46l8-20h9l-8 20zm20 0l8-20h9l-8 20z" fill="#e94b34"/></svg></span><span>Wireline</span></Link><span className="edition">Global briefing · always current</span><ThemeToggle /></div><nav aria-label="Main navigation"><Link href="/">Latest</Link><Link href="/featured">Featured</Link><Link href="/saved">Saved</Link><Link href="/sources">Sources</Link><Link href="/about">About</Link></nav>{breaking && <Link href={`/article/${breaking.id}`} className="breaking-ticker"><strong>Breaking</strong><span>{breaking.title}</span><i>→</i></Link>}</header>;
}

export function Footer() {
  return <footer className="site-footer"><div><strong>Wireline</strong><p>A clear, AI-assisted view of the day’s reporting.</p></div><div><Link href="/about">About this project</Link><br /><a href="/feed.xml">RSS feed</a><p className="source-list">Aggregating: BBC News, The Wall Street Journal, The Guardian, Al Jazeera, NPR</p></div><p className="copyright">© {new Date().getFullYear()} Wireline</p></footer>;
}

export function SiteShell({ children }: { children: ReactNode }) { return <><Header /><main id="main-content">{children}</main><Footer /></>; }
