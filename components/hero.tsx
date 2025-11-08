import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-background">
      <div className="container relative px-8 mx-auto">
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-light tracking-tight leading-[1.1]">
              Find What
              <br />
              You Need
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-light leading-relaxed">
              RevCom connects buyers and sellers directly. List your needs, discover opportunities, and close deals—all in one minimal platform.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button size="lg" asChild className="text-base font-normal">
              <Link href="/auth/login">
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="text-base font-normal">
              <Link href="/auth/sign-up">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
