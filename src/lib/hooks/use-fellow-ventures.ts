"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  createdAt: string;
}

async function fetchVentures(): Promise<Venture[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ventures")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return [];
  return data.map((v: Record<string, unknown>) => ({
    id: v.id as string,
    name: v.name as string,
    description: v.description as string | null,
    industry: v.industry as string | null,
    currentStage: v.current_stage as string | null,
    createdAt: v.created_at as string,
  }));
}

const VENTURES_QUERY_KEY = ["ventures"] as const;

/** Cached ventures list for the current workspace; password gate controls access. */
export function useVentures() {
  return useQuery({
    queryKey: VENTURES_QUERY_KEY,
    queryFn: fetchVentures,
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });
}

export interface VentureDetail {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  googleDriveUrl: string | null;
}

async function fetchVentureDetail(ventureId: string): Promise<VentureDetail | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ventures")
    .select("id, name, description, industry, google_drive_url")
    .eq("id", ventureId)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    industry: data.industry,
    googleDriveUrl: data.google_drive_url,
  };
}

/** Cached single venture by id; used by venture overview so back-from-asset is instant. */
export function useVenture(ventureId: string | null) {
  return useQuery({
    queryKey: ["venture", ventureId] as const,
    queryFn: () => fetchVentureDetail(ventureId!),
    enabled: !!ventureId,
    staleTime: 2 * 60 * 1000,
  });
}
