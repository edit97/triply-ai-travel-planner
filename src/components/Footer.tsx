type FooterProps = { onNavigate: (feature: string) => void }

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <div className="footer-top">
          <div className="footer-about">
            <a className="brand" href="#main">Triply<span>.</span></a>
            <p>AI-powered travel planning for your next adventure.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            {[
              ['Destinations', 'destinations'],
              ['How it works', 'how-it-works'],
              ['AI Planner', 'planner'],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={event => { event.preventDefault(); onNavigate(label) }}>{label}</a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom"><p>Built with React, TypeScript &amp; AI</p><p>© 2026 Triply</p></div>
      </div>
    </footer>
  )
}
