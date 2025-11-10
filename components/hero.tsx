import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container relative px-8 mx-auto z-10">
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-light tracking-tight leading-[1.1] text-blue-600 dark:text-blue-400">
              Find What
              <br />
              You Need
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-light leading-relaxed">
              RevCom connects buyers and sellers directly. Buyers list their needs,
              sellers discover opportunities, and close deals—all in one minimal
              platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button
              size="lg"
              asChild
              className="text-base font-normal bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30"
            >
              <Link href="/auth/login">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-base font-normal border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Link href="/auth/sign-up">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
