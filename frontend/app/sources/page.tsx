const sources = [
  ["BBC News", "https://www.bbc.com/news", "Global reporting and analysis from the BBC."],
  ["The Wall Street Journal", "https://www.wsj.com/", "Business, markets, and world affairs reporting."],
  ["The Guardian", "https://www.theguardian.com/international", "Independent news and commentary from around the world."],
  ["Al Jazeera", "https://www.aljazeera.com/", "International coverage with a focus on under-reported perspectives."],
  ["NPR", "https://www.npr.org/", "Public-service journalism from the United States and beyond."],
];

export default function SourcesPage() { return <div className="page-wrap sources-page"><p className="kicker">Where stories begin</p><h1>Our sources</h1><p className="sources-intro">Wireline summarizes public reporting from these outlets. We are not affiliated with them; always follow the original link for the full report and context.</p><div className="source-directory">{sources.map(([name, link, description]) => <article id={name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={name}><p className="eyebrow">News source</p><h2>{name}</h2><p>{description}</p><a href={link} target="_blank" rel="noreferrer">Visit publisher <span>↗</span></a></article>)}</div></div>; }
