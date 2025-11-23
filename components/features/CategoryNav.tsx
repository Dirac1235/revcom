"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORIES } from '@/lib/constants/categories';
import { ROUTES } from '@/lib/constants/routes';
import { ChevronDown, Grid } from 'lucide-react';

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-border hover:bg-accent hover:text-accent-foreground">
          <Grid className="w-4 h-4" />
          <span className="hidden md:inline font-medium">Categories</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Browse by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={ROUTES.PRODUCTS} className="cursor-pointer">
            All Products
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {CATEGORIES.map((category) => (
          <DropdownMenuItem key={category} asChild>
            <Link
              href={`${ROUTES.PRODUCTS}?category=${encodeURIComponent(category)}`}
              className="cursor-pointer"
            >
              {category}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
