import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'


const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production'
if (production) process.env.NODE_ENV = 'production'
// Local secrets are loaded only in development; production uses host environment.
if (!production && existsSync('.env')) loadEnvFile('.env')

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0)
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 10) {
  throw new Error('TRUST_PROXY_HOPS must be a whole number from 0 to 10.')
}
const app = createApp(undefined, {
  staticDir: production ? fileURLToPath(new URL('../../dist/', import.meta.url)) : undefined,
  trustProxyHops,
})
const port = Number(process.env.PORT || 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number.')
}

const server = production ? app.listen(port, '0.0.0.0') : app.listen(port)
server.on('error', () => {
  console.error('Unable to start the API. Check that PORT is available.')
  process.exitCode = 1
})
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close())
}

