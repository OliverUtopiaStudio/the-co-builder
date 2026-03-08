"use server";

import { getCurrentFellowId } from "@/app/actions/fellows";
import { getVentureDiagnosisByVentureId } from "@/app/actions/diagnosis";
import { getAssetCompletions } from "@/app/actions/responses";
import { getFellowDetail } from "@/app/actions/fellows";

export type PersonalisedLibraryData = {
  ventureId: string | null;
  completion: Record<number, boolean>;
  nextActionAssetNumber: number | null;
};

export async function getPersonalisedLibraryData(): Promise<PersonalisedLibraryData> {
  const { id: fellowId } = await getCurrentFellowId();
  if (!fellowId) {
    return { ventureId: null, completion: {}, nextActionAssetNumber: null };
  }

  const detail = await getFellowDetail(fellowId);
  if (!detail?.venture) {
    return { ventureId: null, completion: {}, nextActionAssetNumber: null };
  }

  const ventureId = detail.venture.id;
  const [completionMap, diagnosis] = await Promise.all([
    getAssetCompletions(ventureId),
    getVentureDiagnosisByVentureId(ventureId),
  ]);

  const nextActionAssetNumber =
    diagnosis?.criticalActions?.[0]?.assetNumber ?? null;

  return {
    ventureId,
    completion: completionMap,
    nextActionAssetNumber,
  };
}
