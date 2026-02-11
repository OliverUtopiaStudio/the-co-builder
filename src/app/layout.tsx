import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Co-Builder | Utopia Studio",
  description:
    "27 Assets from Invention to Spinout — AI-Native Venture Building at Utopia Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
