import { Link } from 'react-router-dom'
import { timeAgo } from '../lib'

function preview(body = '', maxLength = 220) {
  const clean = body.trim()
  if (clean.length <= maxLength) return clean
  return clean.slice(0, maxLength).trim() + '…'
}

export default function FeaturedCard({ article }) {
  const sourceNames = (article.sources || []).map((s) => s.name).join(', ')
  return <Link to={`/featured/${article.id}`} className="theme-card group flex h-full flex-col overflow-hidden rounded-2xl border border-coral/25 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-coral/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 dark:border-coral/30 dark:bg-[#19221c]">
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-coral">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-coral/15 text-[.65rem] text-coral">★</span>
        In depth
      </div>
      <h2 className="font-display text-[1.7rem] leading-[1.1] text-ink transition group-hover:text-moss dark:text-paper">{article.headline}</h2>
      <p className="mt-3 line-clamp-4 text-[.98rem] leading-7 text-ink/65 dark:text-paper/65">{preview(article.body)}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs font-semibold">
        <span className="truncate text-ink/45 dark:text-paper/45">{sourceNames}</span>
        <span className="shrink-0 text-ink/40 dark:text-paper/40">{timeAgo(article.created_at)}</span>
      </div>
    </div>
  </Link>
}
