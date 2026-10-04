import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberScope — Automated Domain Security Investigation",
  description:
    "Scan any domain, IP address, or URL for DNS, WHOIS, SSL, security headers, email authentication, exposed subdomains, and reputation — with a plain-English AI summary and MITRE ATT&CK mapping.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>%F0%9F%9B%A1%EF%B8%8F</text></svg>",
  },
  openGraph: {
    title: "CyberScope — Automated Domain Security Investigation",
    description:
      "DNS, WHOIS, SSL, headers, email auth, subdomains, reputation checks, MITRE ATT&CK mapping, and an AI-generated summary — all in one scan.",
    siteName: "CyberScope",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberScope — Automated Domain Security Investigation",
    description: "An automated OSINT and security recon tool.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}