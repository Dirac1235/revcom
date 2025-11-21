import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevCom - Ethiopia's Premier B2B Marketplace",
  description: "Connect buyers and sellers across Ethiopia. Post your needs, discover products, and get instant quotes from verified sellers.",
  keywords: "B2B marketplace, Ethiopia, buyers, sellers, products, requests, quotes",
  openGraph: {
    title: "RevCom - Ethiopia's Premier B2B Marketplace",
    description: "Connect buyers and sellers across Ethiopia. Post your needs, discover products, and get instant quotes from verified sellers.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <header className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </header>

        <main className="pt-16 flex-1">{children}</main>

        <Footer />

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
