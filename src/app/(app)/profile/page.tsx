"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FellowProfile {
  fullName: string;
  email: string;
  bio: string;
  linkedinUrl: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<FellowProfile>({
    fullName: "",
    email: "",
    bio: "",
    linkedinUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("fellows")
          .select("full_name, email, bio, linkedin_url")
          .eq("auth_user_id", user.id)
          .single();

        if (data) {
          setProfile({
            fullName: data.full_name || "",
            email: data.email || "",
            bio: data.bio || "",
            linkedinUrl: data.linkedin_url || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("fellows")
        .update({
          full_name: profile.fullName,
          bio: profile.bio || null,
          linkedin_url: profile.linkedinUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", user.id);

      if (updateError) throw updateError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-medium mb-6">Your Profile</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface border border-border p-6 space-y-4" style={{ borderRadius: 2 }}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300" style={{ borderRadius: 2 }}>
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-accent/10 border border-accent/20 p-3 text-sm text-accent" style={{ borderRadius: 2 }}>
              ✓ Profile saved successfully
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border border-border bg-border/20 text-muted cursor-not-allowed"
              style={{ borderRadius: 2 }}
            />
            <p className="text-xs text-muted mt-1">
              Email cannot be changed here
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              style={{ borderRadius: 2 }}
              placeholder="Tell us about yourself and your background..."
            />
            <div className="text-right mt-1">
              <span className="text-xs text-muted">
                {profile.bio.length}/500
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="linkedinUrl"
              className="block text-sm font-medium mb-1"
            >
              LinkedIn URL
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) =>
                setProfile({ ...profile, linkedinUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 2 }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
