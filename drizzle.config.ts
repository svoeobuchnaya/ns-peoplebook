import { defineConfig } from 'drizzle-kit'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ─── Load .env.local (drizzle-kit doesn't load it automatically) ────────────
const envFile = resolve(process.cwd(), '.env.local')
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

// ─── Parse DATABASE_URL into individual params ───────────────────────────────
// This bypasses postgres.js's URL parser which throws on invalid percent-encoding
// like %3N (N is not a valid hex digit).
const rawUrl = process.env.DATABASE_URL
if (!rawUrl) throw new Error('DATABASE_URL is not set in .env.local')

const match = rawUrl.match(
  /^(?:postgres(?:ql)?):\/\/([^:@]+):(.+)@([^:@/]+):(\d+)\/([^?]+)/
)
if (!match) throw new Error('Could not parse DATABASE_URL — expected postgresql://user:password@host:port/database')

const [, rawUser, rawPassword, host, portStr, database] = match

// Gracefully decode percent-encoded sequences; fall back to raw string on error
const safeDecode = (s: string) => { try { return decodeURIComponent(s) } catch { return s } }

const user = safeDecode(rawUser)
const password = safeDecode(rawPassword)
const port = parseInt(portStr, 10)

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
  },
  // Only manage the public schema; auth schema is Supabase-managed
  schemaFilter: ['public'],
  verbose: true,
  strict: false,
})
