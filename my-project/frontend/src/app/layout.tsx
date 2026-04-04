import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Threat intelligence dashboard",
  description:
    "Live feed and charts from NVD and AbuseIPDB-backed threat simulation (educational demo).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/nav.css" />
        {/* Sync theme from localStorage before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <nav className="site-nav">
          {/* eslint-disable @next/next/no-html-link-for-pages */}
          <a className="nav-brand" href="/">miggy</a>
          <div className="nav-links">
            <a className="nav-link" href="/workout/">Workout</a>
            <a className="nav-link" href="/portfolio/">Portfolio</a>
            <span className="nav-link nav-link-active">Threats</span>
          </div>
          <div className="nav-end">
            <ThemeToggle />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
