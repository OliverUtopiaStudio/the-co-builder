import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Lazy initialization to avoid errors during build when DATABASE_URL isn't set
let _db: ReturnType<typeof drizzle> | null = null;

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return new Pool({ connectionString });
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      _db = drizzle(getPool(), { schema });
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
