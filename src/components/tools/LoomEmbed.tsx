/**
 * Responsive 16:9 Loom video embed.
 */
export default function LoomEmbed({
  loomId,
  title,
}: {
  loomId: string;
  title: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden bg-black/5"
      style={{ borderRadius: 2, aspectRatio: "16/9" }}
    >
      <iframe
        src={`https://www.loom.com/embed/${loomId}?hide_owner=true&hide_share=true&hide_title=true`}
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
