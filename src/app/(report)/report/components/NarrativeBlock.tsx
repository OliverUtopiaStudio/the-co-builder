export default function NarrativeBlock({
  title,
  text,
}: {
  title?: string | null;
  text?: string | null;
}) {
  if (!title && !text) return null;

  return (
    <div className="mb-6">
      {title && (
        <h2 className="text-xl font-medium mb-2 text-foreground">{title}</h2>
      )}
      {text && (
        <div
          className="text-sm text-muted leading-relaxed bg-surface border border-border p-4"
          style={{ borderRadius: 2 }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
