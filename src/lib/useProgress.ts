"use client";

import { useState, useEffect, useCallback } from "react";
import { stages } from "./data";

const STORAGE_KEY = "co-builder-progress";

export function useProgress() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChecked(JSON.parse(stored));
      } catch {
        setChecked({});
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    }
  }, [checked, loaded]);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const getStageProgress = useCallback(
    (stageId: string) => {
      const stage = stages.find((s) => s.id === stageId);
      if (!stage) return { completed: 0, total: 0, percentage: 0 };
      const allItems = stage.assets.flatMap((a) => a.checklist);
      const total = allItems.length;
      const completed = allItems.filter((item) => checked[item.id]).length;
      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    },
    [checked]
  );

  const getAssetProgress = useCallback(
    (assetNumber: number) => {
      for (const stage of stages) {
        const asset = stage.assets.find((a) => a.number === assetNumber);
        if (asset) {
          const total = asset.checklist.length;
          const completed = asset.checklist.filter(
            (item) => checked[item.id]
          ).length;
          return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        }
      }
      return { completed: 0, total: 0, percentage: 0 };
    },
    [checked]
  );

  const getOverallProgress = useCallback(() => {
    const allItems = stages.flatMap((s) =>
      s.assets.flatMap((a) => a.checklist)
    );
    const total = allItems.length;
    const completed = allItems.filter((item) => checked[item.id]).length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [checked]);

  const resetProgress = useCallback(() => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    checked,
    loaded,
    toggle,
    getStageProgress,
    getAssetProgress,
    getOverallProgress,
    resetProgress,
  };
}
