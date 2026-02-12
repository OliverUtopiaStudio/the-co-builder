export default function AppLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin"
          aria-hidden
        />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}
