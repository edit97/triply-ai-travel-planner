import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Itinerary as TripItinerary } from '../../shared/tripSchema'
import { requestTrip, tripErrorMessage } from '../lib/tripApi'
import Itinerary from './Itinerary'

const budgets = ['Budget', 'Moderate', 'Luxury'] as const
const interests = ['Food', 'Nature', 'Culture', 'History', 'Beaches', 'Adventure', 'Nightlife', 'Shopping'] as const

export default function TripPlanner() {
  const [destination, setDestination] = useState('')
  const [days, setDays] = useState('5')
  const [budget, setBudget] = useState<(typeof budgets)[number]>('Moderate')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ destination: string; itinerary: TripItinerary } | null>(null)
  const activeRequest = useRef<AbortController | null>(null)
  const destinationRef = useRef<HTMLInputElement>(null)
  const daysRef = useRef<HTMLInputElement>(null)
  const firstInterestRef = useRef<HTMLInputElement>(null)

  const destinationError = submitted && !destination.trim()
  const daysValid = Number.isInteger(Number(days)) && Number(days) >= 1 && Number(days) <= 14
  const daysError = submitted && !daysValid
  const interestsError = submitted && selectedInterests.length === 0

  useEffect(() => () => activeRequest.current?.abort(), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (activeRequest.current) return
    setSubmitted(true)
    setError('')
    if (!destination.trim()) {
      destinationRef.current?.focus()
    } else if (!daysValid) {
      daysRef.current?.focus()
    } else if (selectedInterests.length === 0) {
      firstInterestRef.current?.focus()
    } else {
      const controller = new AbortController()
      activeRequest.current = controller
      setLoading(true)
      setResult(null)
      const tripDestination = destination.trim()
      try {
        const itinerary = await requestTrip({ destination: tripDestination, days: Number(days), budget, interests: selectedInterests }, controller.signal)
        if (!controller.signal.aborted) setResult({ destination: tripDestination, itinerary })
      } catch {
        if (!controller.signal.aborted) setError(tripErrorMessage)
      } finally {
        activeRequest.current = null
        if (!controller.signal.aborted) setLoading(false)
      }
    }
  }

  return (
    <section id="planner" className="trip-planner landing-section page-width" aria-labelledby="planner-heading" tabIndex={-1}>
      <div className="section-intro section-intro-centered">
        <span className="eyebrow"><span aria-hidden="true">✧</span> AI Trip Planner</span>
        <h2 id="planner-heading">Let's plan your next adventure</h2>
        <p>Tell us a little about your trip and we'll create a personalized itinerary for you.</p>
      </div>
      <div className="planner-panel">
        <form className="planner-form" onSubmit={handleSubmit} onChange={() => setError('')} aria-busy={loading} noValidate>
          <div className="planner-fields">
            <div className="planner-field">
              <label htmlFor="trip-destination">Where do you want to go?</label>
              <input ref={destinationRef} id="trip-destination" name="destination" type="text" placeholder="e.g. Italy, Japan, Bali" maxLength={120} disabled={loading} value={destination} onChange={event => setDestination(event.target.value)} required aria-invalid={destinationError} aria-describedby={destinationError ? 'destination-error' : undefined} />
              {destinationError && <p className="planner-error" id="destination-error" role="alert">Please enter a destination.</p>}
            </div>
            <div className="planner-field">
              <label htmlFor="trip-days">Number of days <span className="field-hint">(1–14)</span></label>
              <input ref={daysRef} id="trip-days" name="days" type="number" min="1" max="14" step="1" disabled={loading} value={days} onChange={event => setDays(event.target.value)} required aria-invalid={daysError} aria-describedby={daysError ? 'days-error' : undefined} />
              {daysError && <p className="planner-error" id="days-error" role="alert">Choose a whole number from 1 to 14.</p>}
            </div>
          </div>
          <fieldset className="planner-options" disabled={loading}>
            <legend>Budget</legend>
            <div className="budget-options">
              {budgets.map(option => (
                <label className="planner-choice budget-choice" key={option}>
                  <input type="radio" name="budget" value={option} checked={budget === option} onChange={() => setBudget(option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="planner-options" disabled={loading} aria-describedby={interestsError ? 'interests-hint interests-error' : 'interests-hint'}>
            <legend>Interests</legend>
            <p className="field-hint interests-hint" id="interests-hint">What makes a trip feel like you? Choose one or more.</p>
            <div className="interest-options">
              {interests.map((interest, index) => (
                <label className="planner-choice interest-choice" key={interest}>
                  <input ref={index === 0 ? firstInterestRef : undefined} type="checkbox" name="interests" value={interest} checked={selectedInterests.includes(interest)} aria-invalid={interestsError} onChange={event => setSelectedInterests(current => event.target.checked ? [...current, interest] : current.filter(item => item !== interest))} />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
            {interestsError && <p className="planner-error" id="interests-error" role="alert">Please select at least one interest.</p>}
          </fieldset>
          <button className="button button-primary planner-submit" type="submit" disabled={loading}><span aria-hidden="true">✧</span> {loading ? 'Creating your trip...' : 'Generate my trip'} <span aria-hidden="true">↗</span></button>
        </form>
        <div role="status" aria-live="polite" aria-atomic="true">
          {loading && <p className="planner-progress">Creating your trip... This may take a moment.</p>}
          {result && <p className="planner-progress">Your itinerary is ready.</p>}
        </div>
        {error && <p className="planner-api-error" role="alert">{error}</p>}
      </div>
      {result && <Itinerary destination={result.destination} itinerary={result.itinerary} />}
    </section>
  )
}
