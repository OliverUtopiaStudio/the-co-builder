"use client";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="label-uppercase mb-2">Content Library</div>
      </div>
      {children}
    </div>
  );
}
