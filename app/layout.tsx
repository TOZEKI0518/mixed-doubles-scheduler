import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ミックスダブルス乱数表",
  description: "男女ペアのミックスダブルス乱数表を自動作成するアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ミックス乱数表",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}