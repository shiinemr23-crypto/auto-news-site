import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { timeAgo } from '../lib'
import NotFound from './NotFound'

// Splits body into paragraphs, and pulls a trailing "(Source: ...)"
// line off each paragraph so it can be styled distinctly from the
// main prose rather than rendered as a plain sentence.
function parseParagraphs(body = '') {
  return body.split(/\n+/).filter(Boolean).map((raw) => {
    const match = raw.match(/^(.*?)\s*\(Source:\s*(.*?)\)\s*$/s)
    if (!match) return { text: raw.trim(), citation: null }
    return { text: match[1].trim(), citation: match[2].trim() }
  })
}

export default function FeaturedDetail() {
  const { id } = useParams()
  const [state, setState] = useState({ loading: true, article: null, missing: false })

  useEffect(() => {
    let active = true
    getDoc(doc(db, 'featured_articles', id))
      .then((snapshot) => active && setState({
        loading: false,
        article: snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null,
        missing: !snapshot.exists(),
      }))
      .catch(() => active && setState({ loading: false, article: null, missing: true }))
    return () => { active = false }
  }, [id])

  if (state.loading) return <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6">
    <div className="h-4 w-28 animate-pulse rounded bg-moss/10"/>
    <div className="mt-6 h-16 w-full animate-pulse rounded bg-moss/10"/>
    <div className="mt-3 h-16 w-4/5 animate-pulse rounded bg-moss/10"/>
    <div className="mt-10 h-72 animate-pulse rounded-2xl bg-moss/10"/>
  </main>
  if (state.missing) return <NotFound/>

  const { article } = state
  const paragraphs = parseParagraphs(article.body)
  const sources = article.sources || []

  return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-16">
    <Link to="/featured" className="inline-flex text-sm font-bold text-moss transition hover:text-coral dark:text-[#a9d3ba]">← Back to in-depth stories</Link>
    <div className="mt-9">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-coral">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-coral/15 text-[.65rem]">★</span>
        In depth
        <span className="h-1 w-1 rounded-full bg-ink/30 dark:bg-paper/30"/>
        <span className="normal-case tracking-normal text-ink/45 dark:text-paper/45">{timeAgo(article.created_at)}</span>
      </div>
      <h1 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight text-ink dark:text-paper sm:text-6xl">{article.headline}</h1>
    </div>

    <article className="mt-10 font-display text-[1.45rem] leading-[1.72] text-ink/85 dark:text-paper/85 sm:text-[1.7rem]">
      {paragraphs.map((p, index) => <p key={index} className="mb-3">
        {p.text}
        {p.citation && <span className="mt-2 block font-sans text-sm font-semibold normal-case tracking-normal text-ink/40 dark:text-paper/40">Source: {p.citation}</span>}
      </p>)}
    </article>

    <aside className="mt-11 rounded-r-2xl border-l-4 border-coral bg-coral/5 px-6 py-5 dark:bg-coral/10">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-coral">Sources for this story</p>
      <ul className="mt-3 space-y-2">
        {sources.map((s, index) => <li key={index} className="text-sm leading-6 text-ink/70 dark:text-paper/70">
          {s.name} — <a className="font-bold text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss dark:text-[#a9d3ba]" href={s.link} target="_blank" rel="noreferrer">Read the full story ↗</a>
        </li>)}
      </ul>
    </aside>
  </main>
}
