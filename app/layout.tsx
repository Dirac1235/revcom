import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard-nav";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevCom",
  description: "Created with RevCom",
  generator: "revcom",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve user/profile if available. Do not redirect here — keep root layout
  // non-protecting to avoid redirect loops (auth pages need to render). Individual
  // protected routes/pages should enforce auth as needed.
  let user: any = null;
  let profile: any = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: u },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && u) {
      user = u;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    }
  } catch (e) {
    // If anything fails, treat as unauthenticated — avoid throwing from layout
  }

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-blue-100 dark:border-blue-900/50">
          {user ? (
            <DashboardNav user={user} profile={profile} />
          ) : (
            <div className="container mx-auto px-8 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight text-blue-600 dark:text-blue-400"
              >
                RevCom
              </Link>
              <nav className="flex items-center gap-8">
                <Button
                  variant="ghost"
                  asChild
                  className="font-normal hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>

                <Button
                  asChild
                  className="font-normal bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
                >
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </nav>
            </div>
          )}
        </header>

        <main className="pt-16">{children}</main>

        <footer className="border-t py-12 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-100 dark:border-blue-900/50">
          <div className="container px-8 mx-auto text-center text-muted-foreground">
            <p className="text-sm font-light">
              &copy; 2025 RevCom. All rights reserved.
            </p>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
