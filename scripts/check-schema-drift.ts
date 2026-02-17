/**
 * Build-time schema drift detection.
 *
 * Compares Drizzle ORM schema definitions against the live database.
 * If any columns defined in schema.ts are missing from the DB,
 * exits with code 1 and prints exactly what's missing.
 *
 * Run: npx tsx scripts/check-schema-drift.ts
 */

import { Pool } from "pg";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../src/db/schema";

// ─── Extract expected schema from Drizzle ────────────────────────

interface ExpectedColumn {
  table: string;
  column: string;
}

function getExpectedColumns(): ExpectedColumn[] {
  const expected: ExpectedColumn[] = [];

  for (const [, value] of Object.entries(schema)) {
    // pgTable objects have a Symbol that getTableConfig can read
    try {
      const config = getTableConfig(value as any);
      for (const col of config.columns) {
        expected.push({ table: config.name, column: col.name });
      }
    } catch {
      // Not a table (could be a relation, type, etc.) — skip
    }
  }

  return expected;
}

// ─── Query actual database schema ────────────────────────────────

async function getActualColumns(pool: Pool): Promise<Set<string>> {
  const result = await pool.query(
    `SELECT table_name, column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
     ORDER BY table_name, ordinal_position`
  );

  const columns = new Set<string>();
  for (const row of result.rows) {
    columns.add(`${row.table_name}.${row.column_name}`);
  }
  return columns;
}

// ─── Diff and report ─────────────────────────────────────────────

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠ DATABASE_URL not set — skipping schema drift check");
    process.exit(0);
  }

  const expected = getExpectedColumns();
  if (expected.length === 0) {
    console.warn("⚠ No tables found in Drizzle schema — skipping check");
    process.exit(0);
  }

  let pool: Pool;
  try {
    pool = new Pool({ connectionString, connectionTimeoutMillis: 10_000 });
    // Test connection
    await pool.query("SELECT 1");
  } catch (err) {
    console.warn(
      `⚠ Could not connect to database — skipping schema drift check\n  ${err instanceof Error ? err.message : err}`
    );
    process.exit(0);
  }

  try {
    const actual = await getActualColumns(pool);

    // Find columns in Drizzle schema that are missing from DB
    const missing = expected.filter(
      (e) => !actual.has(`${e.table}.${e.column}`)
    );

    if (missing.length === 0) {
      const tables = new Set(expected.map((e) => e.table));
      console.log(
        `✓ Schema check passed — ${tables.size} tables, ${expected.length} columns all present.`
      );
      process.exit(0);
    }

    // Group missing columns by table
    const grouped: Record<string, string[]> = {};
    for (const m of missing) {
      if (!grouped[m.table]) grouped[m.table] = [];
      grouped[m.table].push(m.column);
    }

    console.error("\n✗ Schema drift detected!\n");
    console.error(
      "  The Drizzle schema defines columns that do not exist in the database."
    );
    console.error(
      "  Run the missing migrations in Supabase SQL Editor, then redeploy.\n"
    );

    for (const [table, columns] of Object.entries(grouped)) {
      console.error(`  ${table} table:`);
      for (const col of columns) {
        console.error(`    - ${col}`);
      }
    }

    console.error(
      "\n  See: migrations/ directory for the ALTER TABLE statements.\n"
    );
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
