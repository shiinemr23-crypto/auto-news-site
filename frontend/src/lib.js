export function timeAgo(timestamp) {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null)
  if (!date || Number.isNaN(date.getTime())) return 'Recently added'
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function splitRewrite(rewritten = '') {
  const match = rewritten.match(/(?:^|\n)Source:\s*(.*?)\s*—\s*(https?:\/\/\S+)\s*$/s)
  if (!match) return { body: rewritten, source: null, url: null }
  return { body: rewritten.slice(0, match.index).trim(), source: match[1].trim(), url: match[2].trim() }
}

export function previewText(rewritten = '') {
  return splitRewrite(rewritten).body
}
