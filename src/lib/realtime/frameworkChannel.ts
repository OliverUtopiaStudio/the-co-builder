/**
 * Supabase Realtime channel for framework_edits table.
 * When another admin saves an edit, we get an event and can refetch.
 *
 * Enable in Supabase: Dashboard → Database → Replication → add framework_edits to publication supabase_realtime.
 */

import { createClient } from "@/lib/supabase/client";

export type FrameworkEditsCallback = () => void;

let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

export function subscribeToFrameworkEdits(callback: FrameworkEditsCallback): () => void {
  const supabase = createClient();
  channel = supabase
    .channel("framework-edits")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "framework_edits",
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}
