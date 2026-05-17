import type { Metadata } from "next";
import { Fira_Code, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const SITE_TITLE = "Rafael André — Full Stack Developer";
const SITE_DESCRIPTION =
  "Personal portfolio of Rafael André — a full stack developer building polished, terminal-flavored web experiences.";

export const metadata: Metadata = {
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
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body
        suppressHydrationWarning
        className={`${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
