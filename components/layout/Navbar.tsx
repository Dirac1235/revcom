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
import { useAuth } from '@/components/providers/AuthProvider';
import { ThemeToggle } from '@/components/theme-toggle';
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
  Loader2,
  LayoutGrid,
  Search,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut, isBuyer, isSeller, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    router.push(ROUTES.HOME);
    router.refresh();
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

  // Nav links (Home, Products, Explore, Listings)
  const NavLinks = () => (
    <>
      <Link href={ROUTES.HOME} onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" size="sm" className="gap-2 justify-start w-full md:w-auto md:gap-0 md:justify-center md:px-4 font-medium">
          <Home className="w-4 h-4 md:hidden" />
          <span>Home</span>
        </Button>
      </Link>
      <Link href={ROUTES.PRODUCTS} onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" size="sm" className="gap-2 justify-start w-full md:w-auto md:gap-0 md:justify-center md:px-4 font-medium">
          <ShoppingBag className="w-4 h-4 md:hidden" />
          <span>Products</span>
        </Button>
      </Link>
      <Link href={ROUTES.LISTINGS} onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" size="sm" className="gap-2 justify-start w-full md:w-auto md:gap-0 md:justify-center md:px-4 font-medium">
          <LayoutGrid className="w-4 h-4 md:hidden" />
          <span>Requests</span>
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="border-b bg-background border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Logo + Desktop Main Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href={ROUTES.HOME}
              className="text-2xl font-serif font-bold text-foreground tracking-tight shrink-0"
            >
              RevCom
            </Link>

            {/* Desktop primary links (Home, Products) */}
            <div className="hidden md:flex items-center gap-6">
              <NavLinks />
            </div>
          </div>

          {/* 2. Desktop Search & Categories (lg+) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-8">
            <CategoryNav />
            <SearchBar placeholder="Search products, requests..." className="flex-1" />
          </div>

          {/* 3. Desktop Actions (auth, icons, create) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="w-4 h-4 animate-spin" />
              </Button>
            ) : !user ? (
              <div className="flex items-center gap-3">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href={ROUTES.SIGNUP}>
                  <Button
                    size="sm"
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <>
            

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

                {/* User Profile - now includes role-specific tools */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 pl-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline text-sm">
                        {profile?.first_name || 'Account'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                      <Link href={ROUTES.DASHBOARD}>
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    {/* Buyer Tools Section */}
                    {isBuyer && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Buyer Tools</DropdownMenuLabel>
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
                      </>
                    )}

                    {/* Seller Tools Section */}
                    {isSeller && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Seller Tools</DropdownMenuLabel>
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
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search (always visible below header) */}
        <div className="lg:hidden pb-3 pt-1">
          <SearchBar placeholder="Search..." />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-3 space-y-3">
            <NavLinks />

            {loading ? (
              <div className="py-2 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !user ? (
              <div className="pt-4 flex flex-col gap-3">
                <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.SIGNUP} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="pt-2 border-t mt-2">
                  <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">
                    Quick Links
                  </div>
                  <Link href={ROUTES.DASHBOARD} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={ROUTES.PROFILE} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </div>

                <Link href={ROUTES.MESSAGES} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </Link>

                {isBuyer && (
                  <div className="pt-2">
                    <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">
                      Buyer Tools
                    </div>
                    <Link href={ROUTES.BUYER_REQUESTS} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        My Requests
                      </Button>
                    </Link>
                    <Link href={ROUTES.BUYER_REQUEST_CREATE} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Post Request
                      </Button>
                    </Link>
                    <Link href={ROUTES.BUYER_ORDERS} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </Button>
                    </Link>
                  </div>
                )}

                {isSeller && (
                  <div className="pt-2">
                    <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">
                      Seller Tools
                    </div>
                    <Link href={ROUTES.SELLER_PRODUCTS} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Package className="w-4 h-4 mr-2" />
                        My Products
                      </Button>
                    </Link>
                    <Link href={ROUTES.SELLER_PRODUCT_CREATE} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </Link>
                    <Link href={ROUTES.SELLER_EXPLORE} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Requests
                      </Button>
                    </Link>
                    <Link href={ROUTES.SELLER_ORDERS} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Incoming Orders
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="pt-2 border-t mt-2">
                  <div className="px-2 py-2 flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{profile?.first_name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">{profile?.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}