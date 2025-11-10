import Features from "@/components/features";
import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-blue-100 dark:border-blue-900/50">
        <div className="container mx-auto px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-light tracking-tight text-blue-600 dark:text-blue-400 font-semibold"
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
      </header>

      <main className="pt-16">
        <Hero />
        <Features />

        <section className="py-32 border-t bg-gradient-to-b from-indigo-50/30 via-purple-50/30 to-cyan-50/30 dark:from-indigo-950/10 dark:via-purple-950/10 dark:to-cyan-950/10">
          <div className="container px-8 mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-blue-600 dark:text-blue-400">
              Ready to Start?
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              Join buyers and sellers already using RevCom
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                asChild
                className="font-normal bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30"
              >
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-100 dark:border-blue-900/50">
        <div className="container px-8 mx-auto text-center text-muted-foreground">
          <p className="text-sm font-light">
            &copy; 2025 RevCom. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
