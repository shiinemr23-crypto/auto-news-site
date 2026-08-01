import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const links = [{ to: '/', label: 'Home', icon: '⌂', end: true }, { to: '/saved', label: 'Saved', icon: '♡' }, { to: '/about', label: 'About', icon: 'i' }]
export default function BottomNav() {
  return <nav aria-label="Primary navigation" className="theme-bottom fixed inset-x-0 bottom-0 z-30 border-t border-moss/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-[#121914]/95 md:static md:order-3 md:mt-auto md:border-0 md:bg-transparent">
    <div className="mx-auto flex h-16 max-w-md items-center justify-around md:hidden">{links.map(({ to, label, icon, end }) => <NavLink end={end} key={to} to={to} className={({ isActive }) => `flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-semibold transition ${isActive ? 'text-moss dark:text-[#a9d3ba]' : 'text-ink/45 hover:text-ink dark:text-paper/45 dark:hover:text-paper'}`}><span className="grid h-6 w-6 place-items-center rounded-md text-xl leading-none">{icon}</span>{label}</NavLink>)}<ThemeToggle/></div>
  </nav>
}
