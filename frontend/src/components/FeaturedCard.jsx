import { Link } from 'react-router-dom'
import { timeAgo } from '../lib'
import StoryImage from './StoryImage'

export default function FeaturedCard({ article, compact = false }) {
  const sourceNames = (article.sources || []).map((s) => s.name).join(' · ')
  return <Link to={`/featured/${article.id}`} className={`group block ${compact ? '' : 'theme-card overflow-hidden bg-white dark:bg-[#1b1e1c]'}`}><StoryImage src={article.image} label="Featured story" className={compact ? 'aspect-[4/3]' : 'aspect-[16/9]'}/><div className={compact ? 'pt-3' : 'p-5'}><p className="text-[.65rem] font-bold uppercase tracking-[.17em] text-coral">Featured · {timeAgo(article.created_at)}</p><h2 className={`mt-2 font-display leading-[1.08] text-ink transition group-hover:text-moss dark:text-paper ${compact ? 'text-xl' : 'text-3xl'}`}>{article.headline}</h2>{!compact && <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/65">{article.body}</p>}<p className="mt-3 truncate text-xs font-semibold text-ink/45">{sourceNames}</p></div></Link>
}
