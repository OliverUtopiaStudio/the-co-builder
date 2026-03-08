/**
 * Seed fellows and their ventures from FELLOW_PERSONALISATION_PLAN.md.
 * Run: npx tsx scripts/seed-fellows.ts
 */

import { randomUUID } from "crypto";
import { db } from "../src/db";
import { fellows, ventures } from "../src/db/schema";
import { eq } from "drizzle-orm";

const SEED_FELLOWS: { fullName: string; ventureName: string }[] = [
  { fullName: "Urav Shah", ventureName: "Evos" },
  { fullName: "Alexandra Coleman", ventureName: "Azraq" },
  { fullName: "Ganesh Sahane", ventureName: "Durian Labs" },
  { fullName: "Dr. Haji", ventureName: "Mentix" },
  { fullName: "Ruby Smith", ventureName: "Serve" },
  { fullName: "Phares Kariuki", ventureName: "Ruckstack" },
  { fullName: "Dr. Satheesh", ventureName: "Barrier Intelligence" },
];

async function seed() {
  for (const row of SEED_FELLOWS) {
    const existing = await db
      .select()
      .from(fellows)
      .where(eq(fellows.fullName, row.fullName))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Skip (exists): ${row.fullName} → ${row.ventureName}`);
      continue;
    }

    const id = randomUUID();
    await db.insert(fellows).values({
      id,
      authUserId: id,
      fullName: row.fullName,
      email: "",
      role: "fellow",
    });

    await db.insert(ventures).values({
      fellowId: id,
      name: row.ventureName,
      currentStage: "00",
      isActive: true,
    });

    console.log(`Seeded: ${row.fullName} → ${row.ventureName}`);
  }
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
