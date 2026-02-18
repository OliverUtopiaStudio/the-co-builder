"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface FellowProfile {
  id: string;
  fullName: string;
  email: string;
  lifecycleStage: string | null;
  experienceProfile: string | null;
}

export interface Venture {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  currentStage: string | null;
  createdAt: string;
}

async function fetchFellow(): Promise<FellowProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("fellows")
    .select("id, full_name, email, lifecycle_stage, experience_profile")
    .eq("auth_user_id", user.id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    lifecycleStage: data.lifecycle_stage,
    experienceProfile: data.experience_profile ?? null,
  };
}

async function fetchVentures(fellowId: string): Promise<Venture[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("ventures")
    .select("*")
    .eq("fellow_id", fellowId)
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

const FELLOW_QUERY_KEY = ["fellow"] as const;
const VENTURES_QUERY_KEY = (fellowId: string) => ["ventures", fellowId] as const;

/** Cached fellow profile; used by dashboard and anywhere we need current user's fellow record. */
export function useFellow() {
  return useQuery({
    queryKey: FELLOW_QUERY_KEY,
    queryFn: fetchFellow,
    staleTime: 2 * 60 * 1000, // 2 minutes – reduce refetches when navigating
  });
}

/** Cached ventures list for the current fellow; depends on fellowId from useFellow. */
export function useVentures(fellowId: string | null) {
  return useQuery({
    queryKey: VENTURES_QUERY_KEY(fellowId ?? ""),
    queryFn: () => fetchVentures(fellowId!),
    enabled: !!fellowId,
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
