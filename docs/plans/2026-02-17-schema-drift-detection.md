# Schema Drift Detection — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent schema drift (Drizzle schema defining columns that don't exist in the database) from silently breaking production by failing the Vercel build with a clear error.

**Architecture:** A single TypeScript script uses Drizzle's `getTableConfig()` API to extract expected tables/columns from `src/db/schema.ts`, connects to the live database via `DATABASE_URL`, queries `information_schema.columns` for actual columns, diffs them, and exits non-zero if any Drizzle columns are missing from the DB. Runs as a `prebuild` npm script so every Vercel deploy checks automatically.

**Tech Stack:** TypeScript, Drizzle ORM (`getTableConfig` from `drizzle-orm/pg-core`), `pg` (already a dependency), `tsx` (for running TS at build time)

---

## Task 1: Create the drift detection script

**Files:**
- Create: `scripts/check-schema-drift.ts`

**Step 1: Write the script**

```ts
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
```

**Step 2: Test the script runs against the live DB**

Run: `npx tsx scripts/check-schema-drift.ts`
Expected: `✓ Schema check passed — N tables, N columns all present.`

**Step 3: Commit**

```bash
git add scripts/check-schema-drift.ts
git commit -m "feat: add build-time schema drift detection script"
```

---

## Task 2: Wire into build lifecycle

**Files:**
- Modify: `package.json` — add `prebuild` and `db:check` scripts

**Step 1: Add npm scripts**

In `package.json`, add to the `"scripts"` block:

```json
"prebuild": "npx tsx scripts/check-schema-drift.ts",
"db:check": "npx tsx scripts/check-schema-drift.ts"
```

The full scripts block becomes:

```json
"scripts": {
  "dev": "next dev",
  "prebuild": "npx tsx scripts/check-schema-drift.ts",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:check": "npx tsx scripts/check-schema-drift.ts"
}
```

**Step 2: Verify prebuild runs before build**

Run: `npm run build`
Expected: Schema check runs first, then `next build` proceeds.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: wire schema drift check into prebuild lifecycle"
```

---

## Task 3: Verify detection works (simulate drift)

**Step 1: Temporarily add a fake column to schema to simulate drift**

In `src/db/schema.ts`, inside the `fellows` table definition, temporarily add:

```ts
fakeTestColumn: text("fake_test_column"),
```

**Step 2: Run the check — expect failure**

Run: `npx tsx scripts/check-schema-drift.ts`
Expected output includes:

```
✗ Schema drift detected!

  fellows table:
    - fake_test_column
```

And exit code 1.

**Step 3: Remove the fake column**

Revert the change to `src/db/schema.ts`.

**Step 4: Run again — expect success**

Run: `npx tsx scripts/check-schema-drift.ts`
Expected: `✓ Schema check passed`

---

## Task 4: Update deployment checklist

**Files:**
- Modify: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`

**Step 1: Add schema drift note**

After the "Step 2: Migrations" section, add a note explaining that the build now auto-checks for missing migrations.

**Step 2: Commit**

```bash
git add docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md
git commit -m "docs: note build-time schema drift detection in deployment checklist"
```
