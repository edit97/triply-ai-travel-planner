const steps = [
  { number: '01', title: 'Tell us about your trip', description: 'Choose your destination, travel dates, budget and interests.', icon: 'preferences' },
  { number: '02', title: 'Let AI create your plan', description: 'Triply creates a personalized day-by-day itinerary.', icon: 'sparkle' },
  { number: '03', title: 'Pack your bags', description: 'Review your itinerary and get ready for your adventure.', icon: 'bag' },
] as const

function StepIcon({ kind }: { kind: (typeof steps)[number]['icon'] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'preferences' && <><path d="M5 9h22M5 23h22" /><circle cx="12" cy="9" r="3" fill="currentColor"/><circle cx="21" cy="23" r="3" fill="currentColor"/></>}
      {kind === 'sparkle' && <><path d="m16 4 3.5 8.5L28 16l-8.5 3.5L16 28l-3.5-8.5L4 16l8.5-3.5L16 4Z"/><path d="M26 3v6M23 6h6"/></>}
      {kind === 'bag' && <><rect x="7" y="9" width="18" height="18" rx="3"/><path d="M12 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M12 14v8M20 14v8M11 27v2M21 27v2"/></>}
    </svg>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works landing-section" aria-labelledby="how-it-works-heading" tabIndex={-1}>
      <div className="page-width">
        <div className="section-intro section-intro-centered">
          <span className="eyebrow">How it works</span>
          <h2 id="how-it-works-heading">Your perfect trip in 3 simple steps</h2>
        </div>
        <ol className="steps-grid">
          {steps.map(step => (
            <li className="step-card" key={step.number}>
              <div className="step-top"><span className="step-icon"><StepIcon kind={step.icon} /></span><span className="step-number" aria-hidden="true">{step.number}</span></div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
