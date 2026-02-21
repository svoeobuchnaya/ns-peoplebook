#!/usr/bin/env node
/**
 * NS Peoplebook — Drizzle migration runner
 *
 * Uses individual connection params to bypass URL-encoding issues
 * with the Supabase pooler connection string.
 *
 * Usage:
 *   node scripts/migrate.mjs
 *   or via npm:
 *   npm run db:migrate
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ─── Load .env.local ───────────────────────────────────────────
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

// ─── Parse connection string ────────────────────────────────────
const rawUrl = process.env.DATABASE_URL
if (!rawUrl) {
  console.error('❌  DATABASE_URL is not set in .env.local')
  process.exit(1)
}

// Extract components without relying on URL-decoding the password
// Pattern: postgresql://user:password@host:port/database
const match = rawUrl.match(
  /^(?:postgres(?:ql)?):\/\/([^:@]+):(.+)@([^:@/]+):(\d+)\/([^?]+)/
)
if (!match) {
  console.error('❌  Could not parse DATABASE_URL — unexpected format')
  console.error('    Expected: postgresql://user:password@host:port/database')
  process.exit(1)
}

const [, rawUser, rawPassword, host, portStr, database] = match

// URL-decode user and password parts — handle invalid sequences gracefully
const safeDecodeURIComponent = (s) => {
  try {
    return decodeURIComponent(s)
  } catch {
    // Invalid percent-encoding — return as-is (e.g. %3N)
    return s
  }
}

const user = safeDecodeURIComponent(rawUser)
const password = safeDecodeURIComponent(rawPassword)
const port = parseInt(portStr, 10)

console.log(`\n🔗  Connecting to ${host}:${port}/${database}`)
console.log(`    User: ${user}`)
console.log(`    SSL:  required\n`)

// ─── Connect & migrate ──────────────────────────────────────────
const sql = postgres({
  host,
  port,
  user,
  password,
  database,
  ssl: 'require',
  prepare: false,     // Required for pgBouncer transaction mode (port 6543)
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

const db = drizzle(sql)

console.log('⏳  Running migrations...\n')

try {
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('\n✅  Migrations applied successfully!')
} catch (err) {
  console.error('\n❌  Migration failed:')
  console.error(err.message || err)
  if (err.cause) console.error('Cause:', err.cause)
  if (err.detail) console.error('Detail:', err.detail)
  if (err.code) console.error('PG Code:', err.code)
  console.error(err)
  process.exit(1)
} finally {
  await sql.end()
}
