"use client";

import Link from "next/link";
import { useState } from "react";
import type { ConnectionStatus } from "@/app/actions/connections";

interface ConnectionStatusProps {
  connection: ConnectionStatus;
  onVerify?: () => Promise<void>;
  showVerifyButton?: boolean;
}

export default function ConnectionStatusCard({
  connection,
  onVerify,
  showVerifyButton = false,
}: ConnectionStatusProps) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!onVerify) return;
    setVerifying(true);
    try {
      await onVerify();
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = () => {
    if (!connection.connected) {
      return "⚪"; // Not connected
    }
    if (connection.verified) {
      return "✅"; // Connected and verified
    }
    if (connection.error) {
      return "⚠️"; // Error
    }
    return "🟡"; // Connected but not verified
  };

  const getStatusColor = () => {
    if (!connection.connected) {
      return "text-muted";
    }
    if (connection.verified) {
      return "text-green-600";
    }
    if (connection.error) {
      return "text-red-600";
    }
    return "text-yellow-600";
  };

  const getStatusText = () => {
    if (!connection.connected) {
      return "Not Connected";
    }
    if (connection.verified) {
      return "Connected & Verified";
    }
    if (connection.error) {
      return `Error: ${connection.error}`;
    }
    return "Connected (Not Verified)";
  };

  return (
    <div
      className="bg-surface border border-border p-4"
      style={{ borderRadius: 2 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <div className="text-sm font-medium">
              {connection.type === "google_drive" ? "Google Drive" : "Slack Channel"}
            </div>
            {connection.name && (
              <div className="text-xs text-muted">{connection.name}</div>
            )}
          </div>
        </div>
        <div className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {connection.url && (
        <div className="mt-2">
          <Link
            href={connection.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            {connection.type === "google_drive"
              ? "Open Google Drive Folder →"
              : "Open Slack Channel →"}
          </Link>
        </div>
      )}

      {connection.error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2" style={{ borderRadius: 2 }}>
          {connection.error}
        </div>
      )}

      {showVerifyButton && connection.connected && !connection.verified && (
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="mt-2 text-xs px-3 py-1 bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
          style={{ borderRadius: 2 }}
        >
          {verifying ? "Verifying..." : "Verify Connection"}
        </button>
      )}

      {connection.verifiedAt && (
        <div className="mt-2 text-xs text-muted">
          Verified: {new Date(connection.verifiedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
