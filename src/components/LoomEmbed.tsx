export function LoomEmbed({ url }: { url: string }) {
  // Convert share URL to embed URL
  const embedUrl = url.replace("/share/", "/embed/");

  return (
    <div
      className="bg-surface border border-border overflow-hidden"
      style={{ borderRadius: 2 }}
    >
      <div className="label-uppercase px-5 pt-4 pb-2">Lesson Video</div>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
