import { useEffect, useState } from 'react'

function getInitialTheme() {
  const saved = localStorage.getItem('briefly-theme')
  return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('briefly-theme', theme) }, [theme])
  const dark = theme === 'dark'
  return <button type="button" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Use light mode' : 'Use dark mode'} className="grid h-9 w-9 place-items-center rounded-full border border-moss/15 bg-paper/70 text-base text-moss shadow-sm transition hover:border-moss/35 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-paper dark:hover:bg-white/20">{dark ? '☀' : '◐'}</button>
}
