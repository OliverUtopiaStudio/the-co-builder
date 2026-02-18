import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { fellows, pods } from "@/db/schema";
import { eq } from "drizzle-orm";

const POD_SEED_DATA: Record<
  string,
  {
    thesis: string;
    marketGap: string;
    targetArchetype: string;
    optimalFellowProfile: string;
  }
> = {
  "Infra Intelligence": {
    thesis:
      "Intelligence layer for $106T of aging critical infrastructure — energy grids, data centers, industrial assets — where AI-native software replaces manual inspection, reactive maintenance, and siloed operations.",
    marketGap:
      "Manual inspection, reactive maintenance, and siloed operations persist across aging infrastructure worth $106T globally. The shift from analog to intelligent infrastructure creates a massive opportunity for AI-native operating systems.",
    targetArchetype:
      "Deep infrastructure domain expertise combined with AI/ML capability. Ex-utility engineers, grid operators, industrial IoT builders who understand the physical constraints of infrastructure systems.",
    optimalFellowProfile:
      "Technical founders with 5-10+ years in energy, data centers, or industrial operations. Strong ML/AI skills applied to physical systems. Experience with sensor data, digital twins, or predictive analytics in infrastructure contexts.",
  },
  "Decarb Industry": {
    thesis:
      "Industrial decarbonization reframed as an optimization problem — reducing emissions through smarter logistics, lower-carbon materials, and extended asset lifecycles rather than pure substitution.",
    marketGap:
      "Emissions reduction is treated as a cost center rather than an optimization opportunity. Industrial supply chains, materials production, and asset management remain largely unoptimized for carbon efficiency.",
    targetArchetype:
      "Industrial process expertise combined with sustainability quantification. Supply chain engineers, materials scientists, and industrial operations specialists who can quantify and optimize carbon impact.",
    optimalFellowProfile:
      "Founders from industrial logistics, materials science, or manufacturing operations. Ability to measure and reduce embodied carbon, optimize cross-border routing, or extend asset lifecycles through predictive analytics.",
  },
  "Sovereign Systems": {
    thesis:
      "National-scale digital, compute, and energy infrastructure for GCC, Southeast Asia, and Africa — building sovereign capability rather than dependence on foreign platforms for critical national systems.",
    marketGap:
      "Emerging nations depend on foreign platforms for critical national infrastructure — data sovereignty, energy grids, identity systems. This creates strategic vulnerability and limits economic self-determination.",
    targetArchetype:
      "Government and institutional understanding combined with deep tech capability. Former civil servants, national infrastructure builders, and GovTech operators who can navigate public-sector procurement.",
    optimalFellowProfile:
      "Founders who understand sovereign technology requirements in GCC, SEA, or Africa. Experience building national-scale platforms (identity, health, payments, energy) with strong public-sector relationships and regulatory navigation skills.",
  },
  "Flow Rails": {
    thesis:
      "Programmable economic infrastructure — replacing fragmented payment corridors, opaque wealth management, and exclusionary SME lending with software-native financial rails built for emerging markets.",
    marketGap:
      "Fragmented payment rails, opaque wealth management, and exclusionary lending persist across emerging markets. Cross-border transactions remain expensive, tokenized assets inaccessible, and SME credit scarce.",
    targetArchetype:
      "Financial infrastructure expertise combined with regulatory navigation. Ex-payments operators, central bank technologists, and fintech infrastructure builders who understand corridor economics.",
    optimalFellowProfile:
      "Founders from payments infrastructure, central banking, or financial inclusion. Deep understanding of cross-border settlement, stablecoin/CBDC mechanics, or alternative credit underwriting for underserved markets.",
  },
  "Domain Experiments": {
    thesis:
      "Vertical AI for healthcare, industry, and research — purpose-built AI systems for domains where horizontal tools fail due to regulatory complexity, safety requirements, or specialized workflow needs.",
    marketGap:
      "Horizontal AI tools fail in regulated, safety-critical, and workflow-complex domains. Healthcare documentation, clinical diagnostics, and industrial research require purpose-built AI that understands domain constraints.",
    targetArchetype:
      "Deep domain expertise in healthcare or research combined with AI product capability. Clinicians-turned-founders, research scientists, and domain workflow specialists.",
    optimalFellowProfile:
      "Founders with direct clinical, research, or industrial operations experience who understand why generic AI fails in their domain. Strong product sense for building compliant, safety-aware AI systems.",
  },
};

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [fellow] = await db
    .select({ role: fellows.role })
    .from(fellows)
    .where(eq(fellows.authUserId, user.id))
    .limit(1);

  if (!fellow || fellow.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: Array<{ pod: string; status: string }> = [];

  for (const [podName, data] of Object.entries(POD_SEED_DATA)) {
    const [existing] = await db
      .select({ id: pods.id })
      .from(pods)
      .where(eq(pods.name, podName))
      .limit(1);

    if (!existing) {
      results.push({ pod: podName, status: "not_found" });
      continue;
    }

    await db
      .update(pods)
      .set({
        thesis: data.thesis,
        marketGap: data.marketGap,
        targetArchetype: data.targetArchetype,
        optimalFellowProfile: data.optimalFellowProfile,
        updatedAt: new Date(),
      })
      .where(eq(pods.id, existing.id));

    results.push({ pod: podName, status: "updated" });
  }

  return NextResponse.json({ results });
}
