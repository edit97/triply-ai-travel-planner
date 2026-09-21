import { itinerarySchemaForDays, tripRequestSchema } from '../../shared/tripSchema'
import type { Itinerary } from '../../shared/tripSchema'

type TripFormData = {
  destination: string
  days: number
  budget: string
  interests: string[]
}

export const tripErrorMessage = "We couldn't create your trip right now. Please try again."

export async function requestTrip(data: TripFormData, signal: AbortSignal): Promise<Itinerary> {
  try {
    const trip = tripRequestSchema.parse(data)
    const response = await fetch('/api/generate-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
      signal: AbortSignal.any([signal, AbortSignal.timeout(75_000)]),
    })
    if (!response.ok) throw new Error(tripErrorMessage)

    const itinerary = itinerarySchemaForDays(trip.days).parse(await response.json())
    if (itinerary.days.some((day, index) => day.day !== index + 1)) {
      throw new Error(tripErrorMessage)
    }
    return itinerary
  } catch {
    // Never surface raw HTTP bodies, provider errors, or parsing details.
    throw new Error(tripErrorMessage)
  }
}
