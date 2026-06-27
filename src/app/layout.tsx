import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInjector } from "@/components/theme-injector";
import { Analytics } from "@/components/analytics";
import { clientEnv } from "@/config/env";
import "./globals.css";

/**
 * Font Preloading Strategy:
 * - next/font/google automatically preloads font files via <link rel="preload">
 * - display: "swap" prevents FOIT by rendering fallback text immediately
 * - subsets: ["latin"] reduces payload by loading only required character sets
 * - No external @import or @font-face declarations — all fonts self-hosted by Next.js
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = clientEnv.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NowYouKnowMe — Portfolio",
    template: "%s | NowYouKnowMe",
  },
  description:
    "Personal portfolio showcasing cybersecurity, cloud, and web development projects.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NowYouKnowMe",
    title: {
      default: "NowYouKnowMe — Portfolio",
      template: "%s | NowYouKnowMe",
    },
    description:
      "Personal portfolio showcasing cybersecurity, cloud, and web development projects.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "NowYouKnowMe — Portfolio",
      template: "%s | NowYouKnowMe",
    },
    description:
      "Personal portfolio showcasing cybersecurity, cloud, and web development projects.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInjector />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
