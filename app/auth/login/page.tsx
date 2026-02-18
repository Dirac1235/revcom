"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Loader2, Mail, Lock, Eye, EyeOff, Command, 
  ShoppingBag, Package, Tag, ShoppingCart, 
  Truck, Wallet, Store, CreditCard, Users, 
  Box, Globe, ShieldCheck, BarChart3, Zap,
  Coins, Receipt, Scale, Gift, Bell
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { signInWithGoogle } from "@/lib/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
      router.refresh();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const { login } = await import("@/lib/actions/auth");
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
        setIsGoogleLoading(false);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsGoogleLoading(false);
    }
  };

  // Swarm Configuration
  const swarmIcons = [
    { Icon: ShoppingBag, top: '10%', left: '15%', size: 24, delay: '0s' },
    { Icon: Package, top: '25%', left: '70%', size: 32, delay: '1s' },
    { Icon: Tag, top: '50%', left: '10%', size: 20, delay: '2s' },
    { Icon: ShoppingCart, top: '80%', left: '20%', size: 28, delay: '3s' },
    { Icon: Truck, top: '15%', left: '85%', size: 26, delay: '4s' },
    { Icon: Wallet, top: '70%', left: '80%', size: 22, delay: '5s' },
    { Icon: Store, top: '40%', left: '90%', size: 30, delay: '1.5s' },
    { Icon: CreditCard, top: '85%', left: '60%', size: 24, delay: '2.5s' },
    { Icon: Users, top: '10%', left: '50%', size: 28, delay: '3.5s' },
    { Icon: Box, top: '60%', left: '40%', size: 20, delay: '4.5s' },
    { Icon: Globe, top: '30%', left: '30%', size: 24, delay: '0.5s' },
    { Icon: ShieldCheck, top: '75%', left: '5%', size: 22, delay: '5.5s' },
    { Icon: BarChart3, top: '5%', left: '80%', size: 24, delay: '1.2s' },
    { Icon: Zap, top: '90%', left: '45%', size: 20, delay: '2.2s' },
    { Icon: Coins, top: '45%', left: '75%', size: 28, delay: '3.2s' },
    { Icon: Receipt, top: '20%', left: '5%', size: 20, delay: '4.2s' },
    { Icon: Scale, top: '65%', left: '15%', size: 24, delay: '0.8s' },
    { Icon: Gift, top: '35%', left: '65%', size: 26, delay: '1.8s' },
    { Icon: Bell, top: '55%', left: '85%', size: 22, delay: '2.8s' },
  ];

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* LEFT SIDE: Form Area */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background z-20">
        <div className="mx-auto grid w-full max-w-[400px] gap-6">
          
          <div className="grid gap-2 text-center mb-4">
            <div className="flex justify-center mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Command className="h-6 w-6 text-primary" />
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to manage your marketplace dashboard
            </p>
          </div>

          <div className="grid gap-6">
            <Button
              variant="outline"
              type="button"
              className="w-full h-11 relative shadow-sm"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or use your credentials
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-background focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-10 bg-background focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center border border-destructive/20 animate-in fade-in duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-medium transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="underline font-medium hover:text-primary transition-colors">
              Sign up
            </Link>
          </div>
          
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground px-6 opacity-70">
            Secure connection via encrypted protocols
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Independent Floating Icon Swarm */}
      <div className="hidden lg:flex flex-col items-center justify-center relative bg-primary overflow-hidden">
        
        {/* Background Depth Layers */}
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/10 rounded-full blur-[120px] animate-pulse [animation-duration:8s]" />

        {/* Floating Icons Swarm */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {swarmIcons.map((item, index) => (
            <div
              key={index}
              className="absolute animate-float"
              style={{
                top: item.top,
                left: item.left,
                animationDelay: item.delay,
                opacity: 0.2
              }}
            >
              <div className="bg-primary-foreground/10 p-3 rounded-2xl backdrop-blur-[1px] border border-primary-foreground/5 shadow-lg">
                <item.Icon 
                  size={item.size} 
                  className="text-primary-foreground" 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Brand Content */}
        <div className="relative z-10 max-w-lg text-center p-12 select-none">
          <blockquote className="space-y-8">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-primary-foreground leading-tight drop-shadow-2xl">
              "Why search through thousands of listings? I post exactly what I need, and the right partner knocks on my door. It’s sourcing on my own terms."
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="h-1.5 w-16 bg-primary-foreground/30 rounded-full" />
              <footer className="text-primary-foreground/70 text-sm tracking-widest uppercase font-medium">
               Independent Retailer
              </footer>
            </div>
          </blockquote>
        </div>

        {/* Custom Float Keyframes */}
        <style jsx global>{`
          @keyframes float {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(-25px) translateX(15px) rotate(4deg); }
            66% { transform: translateY(15px) translateX(-20px) rotate(-4deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
          .animate-float {
            animation: float 12s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}