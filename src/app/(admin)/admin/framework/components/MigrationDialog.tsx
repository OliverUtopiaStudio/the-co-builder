"use client";

import { useCallback, useState, useEffect } from "react";
import {
  detectLocalStorageData,
  convertLocalStorageToEdits,
  clearLocalStorageData,
  getMigrationDismissed,
  setMigrationDismissed,
} from "../utils/migrationUtils";
import type { AssetEdits } from "@/app/actions/framework";

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useMigrationDialog() {
  const [state, setState] = useState({ show: false, assetCount: 0 });
  useEffect(() => {
    const { hasData, assetNumbers } = detectLocalStorageData();
    const dismissed = getMigrationDismissed();
    setState({
      show: hasData && !dismissed,
      assetCount: assetNumbers.length,
    });
  }, []);
  return state;
}

export default function MigrationDialog({
  onImport,
  onDismiss,
  assetCount,
}: {
  onImport: (data: { assets: Record<string, { assetNumber: number; modifications: AssetEdits }> }) => Promise<void>;
  onDismiss: () => void;
  assetCount: number;
}) {
  const handleImport = useCallback(async () => {
    const { rawByAsset } = detectLocalStorageData();
    const { assets } = convertLocalStorageToEdits(rawByAsset);
    await onImport({ assets });
    clearLocalStorageData();
    setMigrationDismissed();
    onDismiss();
  }, [onImport, onDismiss]);

  const handleBackup = useCallback(() => {
    const { rawByAsset } = detectLocalStorageData();
    const { assets } = convertLocalStorageToEdits(rawByAsset);
    downloadJson(
      {
        exportedAt: new Date().toISOString(),
        source: "localStorage",
        totalModified: Object.keys(assets).length,
        assets,
      },
      `framework-edits-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
  }, []);

  const handleDiscard = useCallback(() => {
    clearLocalStorageData();
    setMigrationDismissed();
    onDismiss();
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-labelledby="migration-title"
    >
      <div
        className="bg-surface border border-border w-full max-w-md p-6"
        style={{ borderRadius: 2 }}
      >
        <h2 id="migration-title" className="text-lg font-semibold mb-2">
          Local framework edits found
        </h2>
        <p className="text-muted text-sm mb-4">
          You have framework edits stored in this browser ({assetCount} asset
          {assetCount !== 1 ? "s" : ""}). Import them into the database so your
          team can see them?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90"
            style={{ borderRadius: 2 }}
          >
            Import to database
          </button>
          <button
            onClick={handleBackup}
            className="w-full px-4 py-2 text-sm font-medium border border-border hover:bg-background/50"
            style={{ borderRadius: 2 }}
          >
            Download backup first
          </button>
          <button
            onClick={handleDiscard}
            className="w-full px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Discard local edits
          </button>
        </div>
      </div>
    </div>
  );
}
