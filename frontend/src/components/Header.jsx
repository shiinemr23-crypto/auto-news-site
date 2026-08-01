import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return <header className="theme-header  border-b border-moss/10 bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#121914]/90">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link to="/" className="flex items-center gap-2.5 font-display text-2xl tracking-tight text-ink dark:text-paper"><span className="grid h-8 w-8 place-items-center rounded-lg bg-moss text-base text-paper">B</span>Briefly</Link>
      <nav className="flex items-center gap-7 text-sm font-semibold text-ink/65 dark:text-paper/65"><Link className="transition hover:text-moss dark:hover:text-[#a9d3ba]" to="/">Latest</Link><Link className="transition hover:text-moss dark:hover:text-[#a9d3ba]" to="/saved">Saved</Link><Link className="transition hover:text-moss dark:hover:text-[#a9d3ba]" to="/about">About</Link><ThemeToggle/></nav>
    </div>
  </header>
}
