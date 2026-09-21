import { z } from 'zod'

export const budgetSchema = z.string().trim().toLowerCase().pipe(z.enum(['budget', 'moderate', 'luxury']))
export const interestSchema = z.string().trim().toLowerCase().pipe(z.enum(['food', 'nature', 'culture', 'history', 'beaches', 'adventure', 'nightlife', 'shopping']))

export const tripRequestSchema = z.strictObject({
  destination: z.string().trim().min(1).max(120),
  days: z.number().int().min(1).max(14),
  budget: budgetSchema,
  interests: z.array(interestSchema).min(1).max(8).refine(
    values => new Set(values).size === values.length,
    'Interests must be unique.',
  ),
})

export const itinerarySchema = z.strictObject({
  summary: z.string().min(1),
  days: z.array(z.strictObject({
    day: z.number().int().min(1).max(14),
    title: z.string().min(1),
    activities: z.array(z.strictObject({
      timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']),
      title: z.string().min(1),
      location: z.string().min(1),
      description: z.string().min(1),
    })).min(1),
  })).min(1).max(14),
})

export function itinerarySchemaForDays(days: number) {
  return itinerarySchema.extend({ days: itinerarySchema.shape.days.length(days) })
}

export type TripRequest = z.infer<typeof tripRequestSchema>
export type Itinerary = z.infer<typeof itinerarySchema>
