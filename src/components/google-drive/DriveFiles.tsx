"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink?: string;
  modifiedTime: string;
  size?: string;
}

interface DriveFilesProps {
  ventureId: string;
  googleDriveUrl: string | null;
}

export default function DriveFiles({ ventureId, googleDriveUrl }: DriveFilesProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folderInfo, setFolderInfo] = useState<{ id: string; name: string; webViewLink: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!googleDriveUrl) {
      setLoading(false);
      return;
    }

    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/google-drive/files?ventureId=${ventureId}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load files");
        }

        const data = await response.json();
        setFiles(data.files || []);
        setFolderInfo(data.folder || null);
      } catch (err) {
        console.error("Failed to load Google Drive files:", err);
        setError(err instanceof Error ? err.message : "Failed to load files");
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [ventureId, googleDriveUrl]);

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "";
    const size = parseInt(bytes, 10);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("folder")) return "📁";
    if (mimeType.includes("document") || mimeType.includes("text")) return "📄";
    if (mimeType.includes("spreadsheet")) return "📊";
    if (mimeType.includes("presentation")) return "📽️";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("pdf")) return "📕";
    return "📎";
  };

  if (!googleDriveUrl) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="text-sm text-muted">
          No Google Drive folder configured for this venture.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="text-sm text-muted">Loading Google Drive files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="text-sm text-red-600 mb-2">Error loading files: {error}</div>
        <div className="text-xs text-muted">
          Make sure GOOGLE_ACCESS_TOKEN is configured in your environment variables.
        </div>
        {googleDriveUrl && (
          <a
            href={googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline mt-2 inline-block"
          >
            Open in Google Drive →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium mb-1">Google Drive Files</h3>
          {folderInfo && (
            <a
              href={folderInfo.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              {folderInfo.name} →
            </a>
          )}
        </div>
        {googleDriveUrl && (
          <a
            href={googleDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            Open Folder →
          </a>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-sm text-muted py-4 text-center">
          No files found in this folder.
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2 hover:bg-background/50 transition-colors"
              style={{ borderRadius: 2 }}
            >
              <span className="text-lg">{getFileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted">
                  {formatDate(file.modifiedTime)}
                  {file.size && ` • ${formatFileSize(file.size)}`}
                </div>
              </div>
              <span className="text-xs text-muted">→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
