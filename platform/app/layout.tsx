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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://strike-iq-black.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Strike IQ | AI-Powered Football & Basketball Betting Intelligence",
    template: "%s | Strike IQ",
  },
  description:
    "Institutional-grade AI football and basketball betting intelligence. Strike IQ analyzes thousands of quantitative data points across Europe's Top 5 Football Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), UEFA Champions League (UCL), and NBA to deliver high-EV predictions, confidence ratings, and bankroll discipline. Data over gut—every stake reasoned.",
  keywords: [
    "AI football predictions",
    "football betting intelligence",
    "Premier League AI betting",
    "La Liga football predictions",
    "Serie A betting model",
    "Bundesliga AI predictions",
    "Ligue 1 betting tips",
    "UCL Champions League predictions",
    "NBA basketball betting model",
    "top 5 football leagues AI",
    "sports betting quantitative analysis",
    "value betting football",
    "Strike IQ",
  ],
  authors: [{ name: "Strike IQ Quantitative Research Team", url: siteUrl }],
  creator: "Strike IQ AI",
  publisher: "Strike IQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Strike IQ",
    title: "Strike IQ | AI-Powered Football & Basketball Betting Intelligence",
    description:
      "Institutional-grade AI football and basketball betting intelligence. Quantitative predictive modeling and confidence scores across Europe's Top 5 Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), UCL, and NBA.",
    images: [
      {
        url: "/banner-section.png",
        width: 1200,
        height: 630,
        alt: "Strike IQ AI Football and Basketball Betting Intelligence Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Strike IQ | AI-Powered Football & Basketball Betting Intelligence",
    description:
      "Institutional-grade AI football and basketball betting intelligence. Quantitative predictive modeling and confidence scores across Europe's Top 5 Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), UCL, and NBA.",
    images: ["/banner-section.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Strike IQ",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
      description:
        "Institutional-grade AI football and basketball betting intelligence platform covering Europe's Top 5 Leagues, UCL, and NBA.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Strike IQ",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Strike IQ AI Prediction Engine",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      description:
        "AI-powered predictive modeling and quantitative betting analytics terminal covering Europe's Top 5 Football Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1), UEFA Champions League (UCL), and Basketball (NBA).",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
