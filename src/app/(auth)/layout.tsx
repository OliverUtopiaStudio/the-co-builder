export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              CB
            </div>
            <span className="text-xl font-bold">The Co-Builder</span>
          </div>
          <p className="text-muted text-sm">AI-Native Venture Building at Utopia Studio</p>
        </div>
        {children}
      </div>
    </div>
  );
}
