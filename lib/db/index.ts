import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// postgres.js client
// prepare: false is required for Supabase pgBouncer (transaction mode, port 6543)
// For direct connections (port 5432), you can remove this restriction
const client = postgres(connectionString, {
  prepare: false,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export type Database = typeof db
