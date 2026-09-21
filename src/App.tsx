import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Destinations from './components/Destinations'
import HowItWorks from './components/HowItWorks'
import TripPlanner from './components/TripPlanner'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const onNavigate = (feature: string) => {
    const sectionId = feature === 'Destinations' ? 'destinations' : feature === 'How it works' ? 'how-it-works' : 'planner'
    const section = document.getElementById(sectionId)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section?.focus({ preventScroll: true })
    section?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' })
  }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar onNavigate={onNavigate} />
    <main id="main" tabIndex={-1}>
      <Hero onNavigate={onNavigate} />
      <Destinations />
      <HowItWorks />
      <TripPlanner />
    </main>
    <Footer onNavigate={onNavigate} />
  </>
}
