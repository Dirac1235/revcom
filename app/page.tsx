import Features from "@/components/features";
import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Landing = () => {
  
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
        <div className="container mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-light tracking-tight">
            RevCom
          </Link>
          <nav className="flex items-center gap-8">
            <Button variant="ghost" asChild className="font-normal">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="font-normal">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="pt-16">
        <Hero />
        <Features />
        
        <section className="py-32 border-t">
          <div className="container px-8 mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight">
              Ready to Start?
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
              Join buyers and sellers already using RevCom
            </p>
            <div className="pt-4">
              <Button size="lg" asChild className="font-normal">
                <Link href="/auth/sign-up">
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-12">
        <div className="container px-8 mx-auto text-center text-muted-foreground">
          <p className="text-sm font-light">&copy; 2025 RevCom. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
