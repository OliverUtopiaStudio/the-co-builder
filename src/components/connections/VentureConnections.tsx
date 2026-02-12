"use client";

import { useEffect, useState } from "react";
import { getVentureConnections, type VentureConnections } from "@/app/actions/connections";
import ConnectionStatusCard from "./ConnectionStatus";

interface VentureConnectionsProps {
  ventureId: string;
  showVerifyButton?: boolean;
}

export default function VentureConnectionsDisplay({
  ventureId,
  showVerifyButton = false,
}: VentureConnectionsProps) {
  const [connections, setConnections] = useState<VentureConnections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getVentureConnections(ventureId);
        setConnections(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load connections");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ventureId]);

  const handleVerify = async () => {
    // Reload connections after verification
    try {
      const result = await getVentureConnections(ventureId);
      setConnections(result);
    } catch (err) {
      console.error("Failed to reload connections:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="text-muted text-sm">Loading connection status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border p-4" style={{ borderRadius: 2 }}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!connections) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label-uppercase mb-3">Venture Connections</div>
        <div className="text-sm text-muted mb-4">
          Verify that your Google Drive folder and Slack channel are properly connected.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionStatusCard
          connection={connections.googleDrive}
          onVerify={handleVerify}
          showVerifyButton={showVerifyButton}
        />
        <ConnectionStatusCard
          connection={connections.slack}
          onVerify={handleVerify}
          showVerifyButton={showVerifyButton}
        />
      </div>

      {!connections.googleDrive.connected && !connections.slack.connected && (
        <div className="bg-yellow-50 border border-yellow-200 p-4" style={{ borderRadius: 2 }}>
          <div className="text-sm text-yellow-800">
            <strong>Setup Required:</strong> Connect your Google Drive folder and Slack channel
            to enable full Co-Build functionality.
          </div>
        </div>
      )}
    </div>
  );
}
