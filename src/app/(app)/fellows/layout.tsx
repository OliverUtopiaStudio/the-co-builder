"use client";

export default function FellowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="label-uppercase mb-2">Fellows</div>
      {children}
    </div>
  );
}
