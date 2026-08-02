import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return <header className="theme-header border-b border-ink/10 bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#111312]/90"><div className="mx-auto flex h-[4.6rem] max-w-7xl items-center justify-between px-5 sm:px-7"><Link to="/" className="font-display text-3xl font-bold tracking-tight text-ink dark:text-paper">Briefly<span className="text-coral">.</span></Link><nav className="flex items-center gap-4 text-sm font-bold text-ink/65 dark:text-paper/65 sm:gap-7"><Link className="transition hover:text-moss" to="/">Latest</Link><Link className="transition hover:text-moss" to="/featured">Featured</Link><Link className="hidden transition hover:text-moss sm:block" to="/saved">Saved</Link><Link className="hidden transition hover:text-moss sm:block" to="/about">About</Link><ThemeToggle/></nav></div></header>
}
