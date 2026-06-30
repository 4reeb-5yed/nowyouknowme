import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInjector } from "@/components/theme-injector";
import { Analytics } from "@/components/analytics";
import { clientEnv } from "@/config/env";
import { getConfig } from "@/server/services/site-config.service";
import { resolveDefaultTheme } from "@/lib/theme";
import "./globals.css";
import "@/styles/themes.css";

/**
 * V3 Typography System:
 * - Fraunces: Display/headline typeface (warm, slightly idiosyncratic serif)
 * - Inter: Body/UI typeface (neutral, readable)
 * - JetBrains Mono: Code/monospace typeface (precision signature)
 */

// Inter for body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Fraunces for headlines (variable optical sizing)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono for code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
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
  let defaultTheme = "system";
  
  try {
    const config = await getConfig();
    defaultTheme = resolveDefaultTheme(config?.theme);
  } catch {
    // Database not available, use system default
    defaultTheme = "system";
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInjector />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
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
