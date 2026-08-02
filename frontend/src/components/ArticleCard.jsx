import { Link } from 'react-router-dom'
import { previewText, timeAgo } from '../lib'
import StoryImage from './StoryImage'

export default function ArticleCard({ article }) {
  return <Link to={`/article/${article.id}`} className="group grid gap-4 border-b border-ink/10 py-5 first:pt-0 sm:grid-cols-[11rem_1fr] sm:gap-6 dark:border-white/10"><StoryImage src={article.image} label={article.source || 'News'} className="aspect-[16/10] w-full"/><div className="flex min-w-0 flex-col"><div className="flex items-center gap-3 text-[.68rem] font-bold uppercase tracking-[.16em]"><span className="text-moss">{article.source || 'News'}</span><span className="text-ink/40">{timeAgo(article.created_at)}</span></div><h2 className="mt-2 font-display text-2xl leading-[1.12] text-ink transition group-hover:text-moss dark:text-paper">{article.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/65">{previewText(article.rewritten)}</p><span className="mt-3 text-xs font-bold uppercase tracking-[.12em] text-coral">Read story →</span></div></Link>
}
