import { useEffect, useRef } from 'react'
import type { Itinerary as TripItinerary } from '../../shared/tripSchema'

type ItineraryProps = { destination: string; itinerary: TripItinerary }

export default function Itinerary({ destination, itinerary }: ItineraryProps) {
  const resultRef = useRef<HTMLElement>(null)

  useEffect(() => {
    resultRef.current?.focus({ preventScroll: true })
    resultRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    })
  }, [itinerary])

  return (
    <section ref={resultRef} className="itinerary" aria-labelledby="itinerary-heading" tabIndex={-1}>
      <div className="section-intro itinerary-intro">
        <span className="eyebrow"><span aria-hidden="true">✧</span> Your personalized itinerary</span>
        <h2 id="itinerary-heading">Your trip to {destination}</h2>
        <p>{itinerary.summary}</p>
      </div>
      <div className="itinerary-days">
        {itinerary.days.map(day => (
          <article className="itinerary-day" key={day.day} aria-labelledby={`day-${day.day}-heading`}>
            <header className="itinerary-day-header">
              <span className="itinerary-day-label">Day {day.day}</span>
              <h3 id={`day-${day.day}-heading`}>{day.title}</h3>
            </header>
            <ul className="itinerary-activities">
              {day.activities.map((activity, index) => (
                <li className="itinerary-activity" key={`${day.day}-${index}`}>
                  <span className="itinerary-time">{activity.timeOfDay}</span>
                  <h4>{activity.title}</h4>
                  <p className="itinerary-location"><span aria-hidden="true">⌖</span> {activity.location}</p>
                  <p className="itinerary-description">{activity.description}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
