import { useRef, useState } from 'react'

type NavbarProps = { onNavigate: (feature: string) => void }

export default function Navbar({ onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  return <header className="site-header">
    <nav className="navbar page-width" aria-label="Main navigation" onKeyDown={event => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false)
    }}>
      <a className="brand" href="#main" aria-label="Triply home"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m5 15 22-9-9 22-3-10-10-3Z" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round"/><path d="m15 18 6-6" stroke="currentColor" strokeWidth="2.3"/></svg>Triply<span>.</span></a>
      <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="nav-links" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
      <div id="nav-links" className={`nav-links${menuOpen ? ' is-open' : ''}`}>
        {['Destinations', 'How it works', 'AI Planner'].map(label => <a key={label} href={label === 'AI Planner' ? '#planner' : `#${label.toLowerCase().replaceAll(' ', '-')}`} onClick={event => { event.preventDefault(); onNavigate(label); setMenuOpen(false) }}>{label}</a>)}
      </div>
      <button className="button nav-cta" type="button" onClick={() => { setMenuOpen(false); onNavigate('Trip planning') }}>Plan a trip <span aria-hidden="true">↗</span></button>
    </nav>
  </header>
}
