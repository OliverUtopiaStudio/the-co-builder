import TestProject from "./TestProject";
import type { ToolDefinition } from "@/types/tools";

/**
 * A single tool card with color strip, description, features, and test project.
 */
export default function ToolCard({ tool }: { tool: ToolDefinition }) {
  const fgColor = tool.color === "#F0F0F0" ? "#1F1E1D" : "rgba(255,255,255,0.9)";

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Color strip + initial */}
        <div
          className="sm:w-20 flex items-center justify-center py-4 sm:py-0 shrink-0"
          style={{ background: tool.color }}
        >
          <span className="text-2xl font-bold" style={{ color: fgColor }}>
            {tool.initial}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">{tool.name}</h3>
              <p className="text-muted text-xs uppercase tracking-wider mt-0.5">
                {tool.tagline}
              </p>
            </div>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 hover:bg-accent/5 transition-colors"
              style={{ borderRadius: 2 }}
            >
              Open Tool ↗
            </a>
          </div>

          <p className="text-muted text-sm mt-3 leading-relaxed">
            {tool.description}
          </p>

          {/* Feature bullets */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {tool.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <span
                  className="shrink-0 w-1 h-1 rounded-full mt-1.5"
                  style={{ background: tool.color }}
                />
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible test project */}
      <TestProject project={tool.testProject} color={tool.color} />
    </div>
  );
}
