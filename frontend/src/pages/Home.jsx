import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import ArticleCard from '../components/ArticleCard'
import FeaturedCard from '../components/FeaturedCard'
import SkeletonCard from '../components/SkeletonCard'

function TopNews({ loading, articles }) {
  return <aside className="theme-top-news rounded-2xl border border-moss/10 bg-white p-6 shadow-card dark:border-white/10 dark:bg-[#19221c]">
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-[.17em] text-coral">Top news</p>
      <span className="text-xs font-semibold text-ink/45 dark:text-paper/45">Latest</span>
    </div>
    {loading && <div className="mt-5 space-y-5">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-moss/10 dark:bg-white/10"/>)}</div>}
    {!loading && articles.length > 0 && <div className="mt-3 grid divide-y divide-moss/10 dark:divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {articles.map((article, index) => <Link to={`/article/${article.id}`} key={article.id} className="group flex gap-3 py-4 first:pt-2 sm:px-4 sm:py-2 sm:first:pl-0 sm:last:pr-0">
        <span className="font-display text-2xl text-coral/70">0{index + 1}</span>
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.13em] text-moss dark:text-[#a9d3ba]">{article.source}</p>
          <p className="mt-1 font-display text-lg leading-5 text-ink transition group-hover:text-moss dark:text-paper dark:group-hover:text-[#a9d3ba]">{article.title}</p>
        </div>
      </Link>)}
    </div>}
    {!loading && articles.length === 0 && <p className="mt-5 text-sm leading-6 text-ink/60 dark:text-paper/60">The next news update will appear here.</p>}
    <div className="mt-3 border-t border-moss/10 pt-4 text-xs leading-5 text-ink/50 dark:border-white/10 dark:text-paper/50">Fresh stories from the current reporting cycle</div>
  </aside>
}

export default function Home() {
  const [state, setState] = useState({ loading: true, articles: [], error: false })
  const [featured, setFeatured] = useState({ loading: true, articles: [] })
  const [selectedSource, setSelectedSource] = useState('All')

  useEffect(() => {
    let active = true
    getDocs(query(collection(db, 'articles'), orderBy('created_at', 'desc'), limit(30)))
      .then((snapshot) => active && setState({ loading: false, articles: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })), error: false }))
      .catch(() => active && setState({ loading: false, articles: [], error: true }))
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getDocs(query(collection(db, 'featured_articles'), orderBy('created_at', 'desc'), limit(3)))
      .then((snapshot) => active && setFeatured({ loading: false, articles: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) }))
      .catch(() => active && setFeatured({ loading: false, articles: [] }))
    return () => { active = false }
  }, [])

  const sources = ['All', 'BBC', 'WSJ', 'The Guardian', 'Al Jazeera', 'NPR']
  const topArticles = state.articles.slice(0, 3)
  const visibleArticles = useMemo(() => selectedSource === 'All'
    ? state.articles
    : state.articles.filter(({ source = '' }) => source.toLowerCase().includes(selectedSource === 'The Guardian' ? 'guardian' : selectedSource.toLowerCase())), [state.articles, selectedSource])

  return <>
    <section className="theme-hero relative overflow-hidden border-b border-moss/10 bg-[#e5eee6] dark:border-white/10 dark:bg-[#17251d]">
      <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full bg-coral/15 blur-3xl"/>
      <div className="absolute -bottom-44 left-[30%] h-80 w-80 rounded-full bg-moss/10 blur-3xl"/>
      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="mb-7 flex items-center gap-3"><span className="h-px w-9 bg-coral"/><p className="text-xs font-bold uppercase tracking-[.2em] text-moss dark:text-[#a9d3ba]">A quieter news desk</p></div>
        <h1 className="max-w-3xl font-display text-5xl leading-[.93] tracking-tight text-ink dark:text-paper sm:text-6xl lg:text-7xl">The world moves fast.<br/><em className="text-moss dark:text-[#a9d3ba]">Take a clearer look.</em></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-ink/70 dark:text-paper/70">Briefly gathers the latest world reporting from established public feeds, then turns the signal into a short, attributed briefing — with the original story always one click away.</p>
        <div className="mt-9 flex flex-wrap gap-3"><a href="#latest" className="rounded-full bg-moss px-5 py-3 text-sm font-bold text-paper transition hover:bg-[#193f30]">Browse today’s briefings <span aria-hidden>↓</span></a><span className="rounded-full border border-moss/15 bg-paper/50 px-4 py-3 text-xs font-bold uppercase tracking-[.12em] text-ink/55 dark:border-white/15 dark:bg-white/10 dark:text-paper/65">Updated every hour</span></div>
      </div>
    </section>
    <section className="theme-filter border-b border-moss/10 bg-paper dark:border-white/10 dark:bg-[#121914]"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 px-5 py-4 sm:px-6"><span className="mr-3 text-xs font-bold uppercase tracking-[.16em] text-ink/40 dark:text-paper/40">Filter by source</span>{sources.map((source) => <button key={source} type="button" onClick={() => setSelectedSource(source)} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${selectedSource === source ? 'bg-moss text-paper' : 'text-ink/70 hover:bg-mist dark:text-paper/70 dark:hover:bg-white/10'}`}>{source}</button>)}</div></section>
    <main id="latest" className="theme-feed mx-auto max-w-6xl scroll-mt-5 px-5 py-11 dark:bg-[#121914] sm:px-6 sm:py-16">
      {!featured.loading && featured.articles.length > 0 && <div className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Multiple outlets, one story</p>
            <h2 className="mt-2 font-display text-4xl text-ink dark:text-paper">Featured</h2>
          </div>
          <Link to="/featured" className="hidden shrink-0 rounded-full bg-coral/10 px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-coral transition hover:bg-coral/20 sm:block">See all featured →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.articles.map((article) => <FeaturedCard key={article.id} article={article}/>)}
        </div>
        <Link to="/featured" className="mt-5 block text-center text-sm font-bold text-coral sm:hidden">See all featured →</Link>
      </div>}

      <div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-coral">{selectedSource === 'All' ? 'From the latest cycle' : `${selectedSource} reporting`}</p><h2 className="mt-2 font-display text-4xl text-ink dark:text-paper">{selectedSource === 'All' ? 'Today’s briefings' : `${selectedSource} briefings`}</h2></div><span className="hidden rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-moss dark:bg-white/10 dark:text-[#a9d3ba] sm:block">New reporting, carefully condensed</span></div>
      <TopNews loading={state.loading} articles={topArticles}/>
      <div className="mt-7">{state.loading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i}/>)}</div>}{!state.loading && state.error && <div className="rounded-2xl border border-coral/20 bg-coral/5 p-8 text-center"><h2 className="font-display text-2xl text-ink dark:text-paper">Couldn’t load the feed</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60 dark:text-paper/60">Please check your connection and refresh to try again.</p></div>}{!state.loading && !state.error && visibleArticles.length === 0 && <div className="rounded-2xl border border-dashed border-moss/25 bg-white p-10 text-center dark:border-white/20 dark:bg-[#19221c]"><p className="font-display text-3xl text-ink dark:text-paper">No briefings from {selectedSource} yet.</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60 dark:text-paper/60">Try another source or check back after the next scheduled update.</p></div>}{!state.loading && !state.error && visibleArticles.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleArticles.map((article) => <ArticleCard key={article.id} article={article}/>)}</div>}</div>
    </main>
  </>
}
