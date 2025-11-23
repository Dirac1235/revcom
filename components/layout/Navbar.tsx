"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/features/SearchBar';
import { CategoryNav } from '@/components/features/CategoryNav';
import { useAuth } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import {
  Home,
  ShoppingBag,
  Package,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  FileText,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut, isBuyer, isSeller } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };

  // Unauthenticated navbar
  if (!user) {
    return (
      <nav className="border-b bg-background border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={ROUTES.HOME}
              className="text-2xl font-serif font-bold text-foreground tracking-tight"
            >
              RevCom
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href={ROUTES.HOME}>
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href={ROUTES.PRODUCTS}>
                <Button variant="ghost" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link href={ROUTES.LISTINGS}>
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Buyer Requests
                </Button>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navbar
  return (
    <nav className="border-b bg-background border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="text-2xl font-serif font-bold text-foreground tracking-tight"
          >
            RevCom
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-8">
            <CategoryNav />
            <SearchBar placeholder="Search products, requests..." className="flex-1" />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Home */}
            <Link href={ROUTES.HOME}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline">Home</span>
              </Button>
            </Link>

            {/* Browse */}
            <Link href={ROUTES.PRODUCTS}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden lg:inline">Products</span>
              </Button>
            </Link>

            {/* Buyer Menu */}
            {isBuyer && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Buyer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Buyer Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.BUYER_REQUESTS}>
                      <FileText className="w-4 h-4 mr-2" />
                      My Requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Request
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.BUYER_ORDERS}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Seller Menu */}
            {isSeller && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Seller
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Seller Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.SELLER_PRODUCTS}>
                      <Package className="w-4 h-4 mr-2" />
                      My Products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.SELLER_PRODUCT_CREATE}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.SELLER_EXPLORE}>
                      <FileText className="w-4 h-4 mr-2" />
                      Browse Requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.SELLER_ORDERS}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Incoming Orders
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Messages */}
            <Link href={ROUTES.MESSAGES}>
              <Button variant="ghost" size="sm" className="relative">
                <MessageSquare className="w-4 h-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500">
                  3
                </Badge>
              </Button>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500">
                    2
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 text-sm text-muted-foreground">
                  <p className="mb-2">🔔 New offer on your request</p>
                  <p>📦 Order status updated</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden xl:inline text-sm">
                    {profile?.first_name || 'Account'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.first_name} {profile?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.PROFILE}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.DASHBOARD}>
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Search (always visible on mobile) */}
        <div className="lg:hidden pb-3">
          <SearchBar placeholder="Search..." />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-2">
            <Link href={ROUTES.HOME} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href={ROUTES.PRODUCTS} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Products
              </Button>
            </Link>
            <Link href={ROUTES.MESSAGES} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
            {isBuyer && (
              <>
                <div className="pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                  BUYER
                </div>
                <Link href={ROUTES.BUYER_REQUESTS} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    My Requests
                  </Button>
                </Link>
                <Link href={ROUTES.BUYER_ORDERS} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
              </>
            )}
            {isSeller && (
              <>
                <div className="pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                  SELLER
                </div>
                <Link href={ROUTES.SELLER_PRODUCTS} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    My Products
                  </Button>
                </Link>
                <Link href={ROUTES.SELLER_EXPLORE} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Requests
                  </Button>
                </Link>
              </>
            )}
            <div className="pt-2 border-t">
              <Link href={ROUTES.PROFILE} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
