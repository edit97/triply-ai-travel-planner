import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import OpenAI from 'openai'
import { createApp } from './app.js'
import { generateTrip, getOpenAIClient, TripGenerationError } from './generateTrip.js'
import type { CreateResponse } from './generateTrip.js'
import { tripRequestSchema } from '../shared/tripSchema.js'

const request = { destination: 'Italy', days: 2, budget: 'moderate', interests: ['food', 'culture'] }
const trip = tripRequestSchema.parse(request)
const itinerary = {
  summary: 'Two relaxed days in Rome.',
  days: [1, 2].map(day => ({
    day, title: `Discover Rome, day ${day}`,
    activities: [{ timeOfDay: 'Morning', title: 'Explore the neighborhood', location: 'Rome', description: 'Walk nearby streets and enjoy a local meal.' }],
  })),
}

function response(text = JSON.stringify(itinerary), status: 'completed' | 'incomplete' = 'completed'): Awaited<ReturnType<CreateResponse>> {
  return { status, output: [{ type: 'message', id: 'test-message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text, annotations: [], logprobs: [] }] }] }
}

test('normalizes selections and rejects invalid requests', () => {
  assert.deepEqual(tripRequestSchema.parse({ ...request, budget: 'Moderate', interests: ['Food', 'Culture'] }), trip)
  for (const change of [{ destination: ' ' }, { days: 0 }, { days: 15 }, { days: 1.5 }, { days: '2' }, { budget: 'free' }, { interests: [] }, { interests: ['unknown'] }, { interests: ['Food', 'food'] }]) {
    assert.equal(tripRequestSchema.safeParse({ ...request, ...change }).success, false)
  }
})

test('uses requested model, separate user data, and strict exact-day schema', async () => {
  const result = await generateTrip(trip, async body => {
    assert.equal(body.model, 'gpt-5.6-luna')
    assert.equal(body.store, false)
    assert.deepEqual(body.input, [{ role: 'user', content: JSON.stringify(trip) }])
    const format = body.text?.format
    assert.equal(format?.type, 'json_schema')
    if (format?.type === 'json_schema') {
      assert.equal(format.strict, true)
      const schema = format.schema as { properties: { days: { minItems: number; maxItems: number } } }
      assert.equal(schema.properties.days.minItems, 2)
      assert.equal(schema.properties.days.maxItems, 2)
    }
    return response()
  })
  assert.deepEqual(result, itinerary)
})

for (const [label, value] of [
  ['malformed JSON', '{'],
  ['wrong schema', JSON.stringify({ summary: 'Incomplete' })],
  ['too few days', JSON.stringify({ ...itinerary, days: itinerary.days.slice(0, 1) })],
  ['too many days', JSON.stringify({ ...itinerary, days: [...itinerary.days, itinerary.days[0]] })],
  ['duplicate day numbers', JSON.stringify({ ...itinerary, days: [itinerary.days[0], itinerary.days[0]] })],
  ['out-of-order days', JSON.stringify({ ...itinerary, days: [...itinerary.days].reverse() })],
]) {
  test(`rejects ${label}`, async () => {
    await assert.rejects(generateTrip(trip, async () => response(value)), { status: 502 })
  })
}

test('rejects incomplete output even when its JSON looks valid', async () => {
  await assert.rejects(generateTrip(trip, async () => response(undefined, 'incomplete')), { status: 502 })
})

test('handles refusals without returning refusal text', async () => {
  await assert.rejects(generateTrip(trip, async () => ({ status: 'completed', output: [{ type: 'message', id: 'test-message', role: 'assistant', status: 'completed', content: [{ type: 'refusal', refusal: 'Internal refusal details' }] }] })), error => error instanceof TripGenerationError && error.status === 422 && !error.message.includes('Internal'))
})

test('sanitizes provider failures and timeouts', async () => {
  for (const [error, status] of [
    [new OpenAI.APIConnectionTimeoutError({ message: 'PRIVATE_UPSTREAM_DETAIL' }), 504],
    [new OpenAI.APIError(401, {}, 'PRIVATE_UPSTREAM_DETAIL', new Headers()), 502],
    [new Error('PRIVATE_UPSTREAM_DETAIL'), 502],
  ] as const) {
    await assert.rejects(generateTrip(trip, async () => { throw error }), caught => caught instanceof TripGenerationError && caught.status === status && !caught.message.includes('PRIVATE_UPSTREAM_DETAIL'))
  }
})

test('missing key produces a safe service-unavailable error without a call', () => {
  const previous = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    assert.throws(() => getOpenAIClient(), { status: 503 })
  } finally {
    if (previous !== undefined) process.env.OPENAI_API_KEY = previous
  }
})

test('HTTP health, validation, success, safe errors and existing rate limit', async () => {
  let calls = 0
  const server = createApp(async input => {
    calls++
    assert.deepEqual(input, trip)
    if (calls === 2) throw new TripGenerationError(504, 'Trip generation took too long. Please try again.')
    if (calls === 3) throw new Error('PRIVATE_UPSTREAM_DETAIL')
    return itinerary as Awaited<ReturnType<typeof generateTrip>>
  }).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const base = `http://127.0.0.1:${address.port}`
  const post = (body: string) => fetch(`${base}/api/generate-trip`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  try {
    assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok' })
    assert.equal((await post('{}')).status, 400)
    assert.equal((await post('{')).status, 400)
    assert.equal(calls, 0)
    const success = await post(JSON.stringify(request))
    assert.equal(success.status, 200)
    assert.equal(success.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await success.json(), itinerary)
    assert.equal((await post(JSON.stringify(request))).status, 504)
    const unexpected = await post(JSON.stringify(request))
    assert.equal(unexpected.status, 500)
    assert.ok(!(await unexpected.text()).includes('PRIVATE_UPSTREAM_DETAIL'))
    for (let i = 0; i < 5; i++) await post('{}')
    assert.equal((await post('{}')).status, 429)
    assert.equal((await fetch(`${base}/api/health`)).status, 200)
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})

test('production serves built assets and HTML while isolating API and private paths', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'triply-static-test-'))
  let server: ReturnType<ReturnType<typeof createApp>['listen']> | undefined
  try {
    await mkdir(join(directory, 'assets'))
    await writeFile(join(directory, 'index.html'), '<!doctype html><div id="root">Triply test</div>')
    await writeFile(join(directory, 'assets', 'app.js'), '/* test asset */')
    const app = createApp(undefined, { staticDir: directory, trustProxyHops: 1 })
    assert.equal(app.get('trust proxy'), 1)
    server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const base = `http://127.0.0.1:${address.port}`
    for (const path of ['/', '/example/deep-link']) {
      const response = await fetch(base + path, { headers: { Accept: 'text/html' } })
      assert.equal(response.status, 200)
      assert.match(response.headers.get('content-type') ?? '', /text\/html/)
      assert.match(await response.text(), /Triply test/)
    }
    const asset = await fetch(base + '/assets/app.js')
    assert.equal(asset.status, 200)
    assert.equal(await asset.text(), '/* test asset */')
    for (const path of ['/api/unknown', '/assets/missing.js', '/.env', '/.env.example', '/server/index.ts', '/package.json']) {
      const response = await fetch(base + path, { headers: { Accept: 'text/html' } })
      assert.equal(response.status, 404, path)
      assert.deepEqual(await response.json(), { error: 'Not found' })
    }
    assert.deepEqual(await (await fetch(base + '/api/health')).json(), { status: 'ok' })
    assert.equal((await fetch(base + '/api/generate-trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400)
    assert.equal((await fetch(base + '/document', { method: 'POST' })).status, 404)
    assert.equal((await fetch(base + '/document', { headers: { Accept: 'application/json' } })).status, 404)
  } finally {
    if (server) {
      server.closeAllConnections()
      await new Promise<void>((resolve, reject) => server!.close(error => error ? reject(error) : resolve()))
    }
    // Only the unique temporary directory created by this test is removed.
    await rm(directory, { recursive: true, force: true })
  }
})

test('production fails clearly when the frontend build is missing', () => {
  assert.throws(() => createApp(undefined, { staticDir: join(tmpdir(), 'triply-nonexistent-build', 'dist') }), /Frontend build missing/)
})
