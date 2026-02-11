import { createClient } from "@/lib/supabase/client";

export async function getCurrentFellowRole(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("fellows")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  return data?.role || "fellow";
}

export function isAdmin(role: string | null): boolean {
  return role === "admin";
}
