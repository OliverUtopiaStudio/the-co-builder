export function DriveTemplateLink({ url }: { url: string }) {
  return (
    <div
      className="bg-surface border border-border p-5"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase mb-2">Template</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-accent/30 text-accent hover:bg-accent/5 transition-colors"
        style={{ borderRadius: 2 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Open Template in Google Drive
      </a>
    </div>
  );
}
