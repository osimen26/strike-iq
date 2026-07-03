import type { Metadata } from "next";
import { Inter, Tilt_Warp, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-main",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const tiltWarp = Tilt_Warp({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "Strike IQ",
  description: "Data over gut. Every stake, reasoned.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${tiltWarp.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
