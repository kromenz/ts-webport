import type { Metadata } from "next";
import { Fira_Code, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Sans carries body copy and headings; mono is reserved for the terminal
// chrome (prompts, file names, pills, dates).
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = "Rafael André — Full Stack Developer";
const SITE_DESCRIPTION =
  "Personal portfolio of Rafael André — a full stack developer building polished, terminal-flavored web experiences.";

// Absolute base for the OG and Twitter image URLs. Without it Next falls back
// to localhost and the social card breaks everywhere it is unfurled.
// VERCEL_PROJECT_PRODUCTION_URL is the stable production domain, unlike
// VERCEL_URL, which changes on every preview deployment.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: SITE_TITLE,
    template: "%s · Rafael André",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Rafael André",
  authors: [{ name: "Rafael André" }],
  creator: "Rafael André",
  keywords: [
    "Rafael André",
    "Full Stack Developer",
    "Portfolio",
    "Next.js",
    "TypeScript",
    "React",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    siteName: "Rafael André",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable, firaCode.variable)}>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
