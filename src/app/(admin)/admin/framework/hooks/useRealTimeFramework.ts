"use client";

import { useEffect, useRef, useCallback } from "react";
import { subscribeToFrameworkEdits } from "@/lib/realtime/frameworkChannel";

/**
 * Subscribes to framework_edits table changes and refetches when another admin edits.
 */
export function useRealTimeFramework(refetch: () => Promise<void>) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const stableRefetch = useCallback(() => {
    refetchRef.current();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToFrameworkEdits(stableRefetch);
    return unsubscribe;
  }, [stableRefetch]);
}
