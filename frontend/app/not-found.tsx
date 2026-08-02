import Link from "next/link";
export default function NotFound() { return <div className="page-wrap not-found"><p className="kicker">404 / signal lost</p><h1>This story isn’t<br /><em>on the wire.</em></h1><p>The link may be out of date, or the article may no longer be available.</p><Link className="source-button" href="/">Return to latest <span>→</span></Link></div>; }
