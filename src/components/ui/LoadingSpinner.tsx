/**
 * Reusable loading spinner — Studio OS styling (accent color).
 */
export default function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "w-4 h-4 border-2" : size === "lg" ? "w-8 h-8 border-2" : "w-5 h-5 border-2";
  return (
    <div
      className={`animate-spin rounded-full border-accent border-t-transparent ${sizeClass} ${className}`}
      style={{ borderRadius: "50%" }}
      aria-hidden
    />
  );
}
