/**
 * Utilities for migrating framework edits from localStorage to the database.
 */

const STORAGE_PREFIX = "framework-edits-";

export interface LocalStorageEditRecord {
  assetNumber: number;
  modifications: {
    title?: string;
    purpose?: string;
    coreQuestion?: string;
    checklist?: Record<string, string>;
    questions?: Record<string, { label?: string; description?: string }>;
  };
}

export function detectLocalStorageData(): {
  hasData: boolean;
  assetNumbers: number[];
  rawByAsset: Record<number, string>;
} {
  if (typeof window === "undefined") {
    return { hasData: false, assetNumbers: [], rawByAsset: {} };
  }
  const assetNumbers: number[] = [];
  const rawByAsset: Record<number, string> = {};
  for (let n = 1; n <= 27; n++) {
    const key = `${STORAGE_PREFIX}${n}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      assetNumbers.push(n);
      rawByAsset[n] = raw;
    }
  }
  return {
    hasData: assetNumbers.length > 0,
    assetNumbers,
    rawByAsset,
  };
}

export function convertLocalStorageToEdits(rawByAsset: Record<number, string>): {
  assets: Record<string, { assetNumber: number; modifications: LocalStorageEditRecord["modifications"] }>;
} {
  const assets: Record<
    string,
    { assetNumber: number; modifications: LocalStorageEditRecord["modifications"] }
  > = {};
  for (const [numStr, raw] of Object.entries(rawByAsset)) {
    try {
      const modifications = JSON.parse(raw) as LocalStorageEditRecord["modifications"];
      const assetNumber = Number(numStr);
      assets[numStr] = { assetNumber, modifications };
    } catch {
      // skip invalid JSON
    }
  }
  return { assets };
}

export function clearLocalStorageData(): void {
  if (typeof window === "undefined") return;
  for (let n = 1; n <= 27; n++) {
    localStorage.removeItem(`${STORAGE_PREFIX}${n}`);
  }
}

export const MIGRATION_DISMISSED_KEY = "framework-migration-dismissed";

export function getMigrationDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(MIGRATION_DISMISSED_KEY) === "1";
}

export function setMigrationDismissed(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(MIGRATION_DISMISSED_KEY, "1");
}
