import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevCom - Ethiopia's Premier B2B Marketplace",
  description:
    "Connect buyers and sellers across Ethiopia. Post your needs, discover products, and get instant quotes from verified sellers.",
  keywords:
    "B2B marketplace, Ethiopia, buyers, sellers, products, requests, quotes",
  openGraph: {
    title: "RevCom - Ethiopia's Premier B2B Marketplace",
    description:
      "Connect buyers and sellers across Ethiopia. Post your needs, discover products, and get instant quotes from verified sellers.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* h-screen + overflow-hidden: body is exactly the viewport, nothing escapes */}
      <body className="font-sans antialiased h-screen overflow-hidden flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider initialUser={user} initialProfile={profile}>
            <Navbar />

            {/* This wrapper takes all remaining height and is the only thing that scrolls */}
            <div className="flex flex-col flex-1 overflow-y-auto pt-16">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>

            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}