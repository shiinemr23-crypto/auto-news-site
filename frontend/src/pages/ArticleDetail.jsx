import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { splitRewrite, timeAgo } from '../lib'
import NotFound from './NotFound'

export default function ArticleDetail() {
  const { id } = useParams(); const [state, setState] = useState({ loading: true, article: null, missing: false })
  useEffect(() => { let active = true; getDoc(doc(db, 'articles', id)).then((snapshot) => active && setState({ loading: false, article: snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null, missing: !snapshot.exists() })).catch(() => active && setState({ loading: false, article: null, missing: true })); return () => { active = false } }, [id])
  if (state.loading) return <main className="mx-auto max-w-3xl px-5 py-14 sm:px-6"><div className="h-4 w-28 animate-pulse rounded bg-moss/10"/><div className="mt-6 h-16 w-full animate-pulse rounded bg-moss/10"/><div className="mt-3 h-16 w-4/5 animate-pulse rounded bg-moss/10"/><div className="mt-10 h-72 animate-pulse rounded-2xl bg-moss/10"/></main>
  if (state.missing) return <NotFound article />
  const { article } = state; const { body, source, url } = splitRewrite(article.rewritten)
  return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-16"><Link to="/" className="inline-flex text-sm font-bold text-moss transition hover:text-coral">← Back to today’s briefings</Link><div className="mt-9"><div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em]"><span className="text-coral">{article.source || 'News'}</span><span className="h-1 w-1 rounded-full bg-ink/30"/><span className="text-ink/45">{timeAgo(article.created_at)}</span></div><h1 className="mt-4 font-display text-4xl leading-[1.02] tracking-tight text-ink sm:text-6xl">{article.title}</h1></div>{article.image && <img className="mt-9 aspect-[16/8] w-full rounded-2xl object-cover shadow-card" src={article.image} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} />}<article className="mt-10 font-display text-[1.45rem] leading-[1.72] text-ink/85 sm:text-[1.7rem]">{body.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index} className="mb-7">{paragraph}</p>)}</article><aside className="mt-11 rounded-r-2xl border-l-4 border-coral bg-coral/5 px-6 py-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-coral">Original reporting</p>{url ? <p className="mt-2 text-sm leading-6 text-ink/70">Source: {source || article.source} — <a className="font-bold text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss" href={url} target="_blank" rel="noreferrer">Read the full story ↗</a></p> : <p className="mt-2 text-sm leading-6 text-ink/70">Source: {article.source || 'Original publisher'}</p>}</aside></main>
}
