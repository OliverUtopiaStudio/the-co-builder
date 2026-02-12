"use client";

import { useState } from "react";
import { tools, defaultTrainingVideos } from "@/data/tools";
import type { TrainingVideo } from "@/types/tools";
import ToolCard from "@/components/tools/ToolCard";
import LoomEmbed from "@/components/tools/LoomEmbed";
import AddVideoForm from "@/components/tools/AddVideoForm";
import { SectionHeader } from "@/components/ui";

export default function ToolsPage() {
  const [videos, setVideos] = useState<TrainingVideo[]>(defaultTrainingVideos);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="label-uppercase mb-2">Resources</div>
        <h1 className="text-2xl font-medium">Co-Build Tools</h1>
        <p className="text-muted text-sm mt-1">
          The toolkit powering your venture build. Master these tools to move
          fast and build with conviction.
        </p>
      </div>

      {/* Tool cards */}
      <div className="space-y-4">
        {tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>

      {/* Training Videos */}
      <div
        className="bg-surface border border-border p-6"
        style={{ borderRadius: 2 }}
      >
        <SectionHeader
          label="Training Videos"
          className="mb-3"
          action={
            !showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs text-accent hover:underline"
              >
                + Add Video
              </button>
            ) : undefined
          }
        />
        <div
          className="border-t border-border mt-1 mb-4"
          style={{ borderColor: "var(--border)" }}
        />

        {/* Add video form */}
        {showAddForm && (
          <div className="mb-6">
            <AddVideoForm
              onAdd={(video) => {
                setVideos((prev) => [...prev, video]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Video grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {videos.map((video) => (
              <div key={video.id}>
                <LoomEmbed loomId={video.loomId} title={video.title} />
                <div className="mt-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{video.title}</h4>
                    {video.duration && (
                      <span
                        className="text-[10px] text-muted bg-background px-1.5 py-0.5"
                        style={{ borderRadius: 2 }}
                      >
                        {video.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5"
                      style={{ borderRadius: 2 }}
                    >
                      {video.category}
                    </span>
                    {video.description && (
                      <span className="text-xs text-muted">
                        {video.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="text-muted text-sm mb-1">
              No training videos added yet
            </div>
            <p className="text-muted-light text-xs max-w-sm mx-auto">
              Click &ldquo;+ Add Video&rdquo; above to embed a Loom recording.
              Paste any Loom share link and it will appear here for fellows to
              watch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
