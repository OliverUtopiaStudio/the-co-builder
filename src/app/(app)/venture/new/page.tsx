"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const industries = [
  "Healthcare",
  "Fintech",
  "Legal Tech",
  "EdTech",
  "Climate Tech",
  "Supply Chain",
  "Real Estate",
  "Insurance",
  "Cybersecurity",
  "HR Tech",
  "Construction",
  "Agriculture",
  "Manufacturing",
  "Retail & Commerce",
  "Government",
  "Other",
];

export default function NewVenturePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a venture name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get fellow ID
      const { data: fellowData } = await supabase
        .from("fellows")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!fellowData) throw new Error("Fellow profile not found");

      // Create venture
      const { data: venture, error: ventureError } = await supabase
        .from("ventures")
        .insert({
          fellow_id: fellowData.id,
          name: name.trim(),
          description: description.trim() || null,
          industry: industry || null,
          google_drive_url: googleDriveUrl.trim() || null,
        })
        .select()
        .single();

      if (ventureError) throw ventureError;

      router.push(`/venture/${venture.id}`);
    } catch (err) {
      console.error("Failed to create venture:", err);
      setError("Failed to create venture. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        ← Back to Dashboard
      </Link>

      <div className="bg-surface border border-border p-6" style={{ borderRadius: 2 }}>
        <h1 className="text-2xl font-medium mb-2">Create New Venture</h1>
        <p className="text-muted text-sm mb-6">
          Define the AI venture you&apos;re going to build through the Co-Build framework.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300 mb-4" style={{ borderRadius: 2 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Venture Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
              placeholder="e.g., MedAI Diagnostics"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              style={{ borderRadius: 2 }}
              placeholder="Brief elevator pitch for your venture..."
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium mb-1">
              Industry
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
            >
              <option value="">Select an industry...</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="googleDriveUrl" className="block text-sm font-medium mb-1">
              Google Drive Folder URL
            </label>
            <input
              id="googleDriveUrl"
              type="url"
              value={googleDriveUrl}
              onChange={(e) => setGoogleDriveUrl(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              style={{ borderRadius: 2 }}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-xs text-muted mt-1">Link your shared Google Drive folder for this venture</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderRadius: 2 }}
          >
            {loading ? "Creating..." : "Create Venture & Start Building"}
          </button>
        </form>
      </div>
    </div>
  );
}
