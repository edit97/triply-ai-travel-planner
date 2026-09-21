import coastImage from '../assets/italian-coast.jpg'

type HeroProps = { onNavigate: (feature: string) => void }

export default function Hero({ onNavigate }: HeroProps) {
  return <section className="hero page-width" aria-labelledby="hero-heading">
    <div className="hero-copy">
      <div className="eyebrow"><span aria-hidden="true">✧</span> AI-powered travel planning</div>
      <h1 id="hero-heading">Your next{' '}<br/>adventure{' '}<br/>starts with <span>AI.</span></h1>
      <p className="hero-description">Tell us where you want to go and Triply will create a personalized travel itinerary in seconds.</p>
      <div className="hero-actions">
        <button className="button button-primary" type="button" onClick={() => onNavigate('Trip planning')}>Plan my trip <span aria-hidden="true">↗</span></button>
        <button className="button button-secondary" type="button" onClick={() => onNavigate('Destinations')}>Explore destinations <span aria-hidden="true">→</span></button>
      </div>
      <p className="hero-note"><span aria-hidden="true">✧</span> Less planning. More discovering.</p>
    </div>
    <div className="hero-visual">
      <div className="visual-accent" aria-hidden="true"/>
      <figure className="destination-photo">
        <img src={coastImage} alt="Colorful buildings perched above the sea in Cinque Terre, Italy" fetchPriority="high"/>
        <figcaption><span className="location-label">⌖ &nbsp; A little inspiration</span><strong>Somewhere you'd<br/>rather be.</strong><span className="destination-name">Cinque Terre, Italy <span aria-hidden="true">↗</span></span></figcaption>
      </figure>
      <div className="visual-stamp" aria-hidden="true"><span>GO SOMEWHERE</span><svg viewBox="0 0 32 32" fill="none"><path d="m4 15 24-11-11 24-3-10-10-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m14 18 8-8" stroke="currentColor" strokeWidth="1.5"/></svg><span>NEW ✦</span></div>
      <div className="itinerary-card"><span className="sparkle-tile" aria-hidden="true">✧</span><div><strong>A little AI. A world of possibilities.</strong><p>Your kind of trip, thoughtfully planned.</p></div><span className="card-check" aria-hidden="true">✓</span></div>
      <span className="visual-caption">BIG ADVENTURES. SMALL PLANNING ENERGY.</span>
    </div>
  </section>
}
