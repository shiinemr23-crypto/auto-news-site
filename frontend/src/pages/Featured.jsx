import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import FeaturedCard from '../components/FeaturedCard'

export default function Featured() {
  const [state, setState] = useState({ loading: true, articles: [], error: false })

  useEffect(() => {
    let active = true
    getDocs(query(collection(db, 'featured_articles'), orderBy('created_at', 'desc')))
      .then((snapshot) => active && setState({ loading: false, articles: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })), error: false }))
      .catch(() => active && setState({ loading: false, articles: [], error: true }))
    return () => { active = false }
  }, [])

  return <main className="mx-auto max-w-6xl px-5 py-11 sm:px-6 sm:py-16">
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">In-depth reporting</p>
      <h1 className="mt-2 font-display text-4xl text-ink dark:text-paper">Featured stories</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60 dark:text-paper/60">Longer pieces published when a story is genuinely being covered across multiple outlets — synthesized and cited paragraph by paragraph, not just summarized from one source.</p>
    </div>

    {state.loading && <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-moss/10"/>)}</div>}

    {!state.loading && state.error && <div className="rounded-2xl border border-coral/20 bg-coral/5 p-8 text-center">
      <h2 className="font-display text-2xl text-ink dark:text-paper">Couldn't load featured stories</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60 dark:text-paper/60">Please check your connection and refresh to try again.</p>
    </div>}

    {!state.loading && !state.error && state.articles.length === 0 && <div className="rounded-2xl border border-dashed border-moss/25 bg-white p-10 text-center dark:border-white/20 dark:bg-[#19221c]">
      <p className="font-display text-3xl text-ink dark:text-paper">No featured stories yet.</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60 dark:text-paper/60">These are published a few times a day, only when a story is trending across multiple sources. Check back soon.</p>
    </div>}

    {!state.loading && !state.error && state.articles.length > 0 && <div className="grid gap-5 sm:grid-cols-2">
      {state.articles.map((article) => <FeaturedCard key={article.id} article={article}/>)}
    </div>}
  </main>
}
