"use client";

import { MessageSquare, FolderOpen, ExternalLink } from "lucide-react";

export type WorkspaceLinks = {
  slackChannelUrl: string | null;
  slackChannelName: string | null;
  googleDriveUrl: string | null;
};

export default function WorkspaceSection({ workspace }: { workspace: WorkspaceLinks }) {
  const hasSlack = !!workspace.slackChannelUrl;
  const hasDrive = !!workspace.googleDriveUrl;
  if (!hasSlack && !hasDrive) return null;

  return (
    <section>
      <h2 className="label-uppercase text-[10px] mb-3 text-muted">
        Your workspace
      </h2>
      <p className="text-muted text-sm mb-3">
        Your team channel and files. Open in a tab and keep Co-Builder here.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {hasSlack && (
          <a
            href={workspace.slackChannelUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 bg-surface border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors touch-manipulation min-h-[72px]"
            style={{ borderRadius: 2 }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#4A154B] text-white">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-foreground block truncate">
                {workspace.slackChannelName ? `#${workspace.slackChannelName}` : "Slack channel"}
              </span>
              <span className="text-xs text-muted">Open in Slack</span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-accent" aria-hidden />
          </a>
        )}
        {hasDrive && (
          <a
            href={workspace.googleDriveUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 bg-surface border border-border hover:border-accent/40 hover:bg-accent/5 transition-colors touch-manipulation min-h-[72px]"
            style={{ borderRadius: 2 }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#4285F4] text-white">
              <FolderOpen className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-foreground block truncate">
                Google Drive folder
              </span>
              <span className="text-xs text-muted">Open in Drive</span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-accent" aria-hidden />
          </a>
        )}
      </div>
    </section>
  );
}
