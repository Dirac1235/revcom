"use client";

import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="relative mb-8">
        <div className="text-[150px] font-bold leading-none select-none text-muted/20">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-3">
        Page Not Found
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved or doesn&apos;t exist.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
