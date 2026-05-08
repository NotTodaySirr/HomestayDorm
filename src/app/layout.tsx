import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomestayDorm",
  description: "He thong quan ly homestay va phong luu tru.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
