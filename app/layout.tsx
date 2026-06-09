import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QC OPERATIONAL DASHBOARD",
  description: "Dashboard kiểm tra chất lượng vải - kết nối Google Sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
