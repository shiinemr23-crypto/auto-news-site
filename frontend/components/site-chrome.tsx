import Link from "next/link";
import type { ReactNode } from "react";

export function Header() {
  return <header className="site-header"><div className="masthead"><Link className="brand" href="/"><span className="brand-mark">S</span><span>Signal Desk</span></Link><span className="edition">Global briefing · always current</span></div><nav aria-label="Main navigation"><Link href="/">Latest</Link><Link href="/featured">Featured</Link><Link href="/about">About</Link></nav></header>;
}

export function Footer() {
  return <footer className="site-footer"><div><strong>Signal Desk</strong><p>A clear, AI-assisted view of the day’s reporting.</p></div><div><Link href="/about">About this project</Link><p className="source-list">Aggregating: BBC News, The Wall Street Journal, The Guardian, Al Jazeera, NPR</p></div><p className="copyright">© {new Date().getFullYear()} Signal Desk</p></footer>;
}

export function SiteShell({ children }: { children: ReactNode }) { return <><Header /><main>{children}</main><Footer /></>; }
