"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ROUTES } from "@/lib/constants/routes";
import {
  ShoppingBag,
  Package,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  FileText,
  Loader2,
  LayoutGrid,
  Search,
  ChevronDown,
  Star,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: ROUTES.HOME, exact: true },
  { label: "Products", href: ROUTES.PRODUCTS, exact: false },
  { label: "Requests", href: ROUTES.LISTINGS, exact: false },
];

export function Navbar() {
  const { user, profile, signOut, isBuyer, isSeller, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fetch notification count
  useEffect(() => {
    let supabase: any = null;
    let subscription: any = null;

    const fetchNotificationCount = async () => {
      if (!user?.id) return;

      try {
        if (!supabase) {
          const { createClient } = await import("@/lib/supabase/client");
          supabase = createClient();
        }

        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    const setupRealtime = async () => {
      if (!user?.id) return;

      try {
        if (!supabase) {
          const { createClient } = await import("@/lib/supabase/client");
          supabase = createClient();
        }

        // Setup real-time subscription for notifications changes
        subscription = supabase
          .channel("public:notifications")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchNotificationCount();
            },
          )
          .subscribe();
      } catch (error) {
        console.error("Error setting up Supabase realtime:", error);
      }
    };

    fetchNotificationCount();
    setupRealtime();

    const interval = setInterval(fetchNotificationCount, 5000);

    return () => {
      clearInterval(interval);
      if (subscription) {
        supabase?.removeChannel(subscription);
      }
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    router.push(ROUTES.HOME);
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (href: string, exact: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name)
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    return profile?.email?.[0]?.toUpperCase() ?? "U";
  };

  const dropdownClass =
    "w-56 rounded-xl border-border/50 bg-card/95 [backdrop-filter:blur(20px)_saturate(150%)] shadow-xl p-0 overflow-hidden";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500  ${
          scrolled
            ? "bg-background/85 [backdrop-filter:blur(20px)_saturate(150%)] border-b border-border/50 shadow-sm"
            : "bg-background/50 [backdrop-filter:blur(12px)] border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-6 md:grid-cols-[1fr_auto_1fr]">
            {/* LEFT — Logo */}
            <Link
              href={ROUTES.HOME}
              className="text-lg font-serif font-bold text-foreground tracking-tight whitespace-nowrap"
            >
              RevCom
            </Link>

            {/* CENTER — Nav links */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, href, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative py-0.5 text-sm font-medium transition-colors duration-200 group ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    {/* underline */}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* RIGHT — Actions */}
            <div className="flex items-center justify-end gap-1">
              {/* Search */}
              <div className="hidden md:flex items-center justify-end">
                {searchOpen ? (
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-1"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-44 h-8 px-3 text-sm rounded-lg border border-border/60 bg-background/70 [backdrop-filter:blur(8px)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted-foreground/50"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Auth */}
              <div className="hidden md:flex items-center">
                {loading ? (
                  <div className="h-8 w-8 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  </div>
                ) : !user ? (
                  <div className="flex items-center gap-2 pl-1">
                    <Link href={ROUTES.LOGIN}>
                      <Button variant="ghost" size="sm" className="h-8 text-sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href={ROUTES.SIGNUP}>
                      <Button
                        size="sm"
                        className="h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 pl-1">
                    <Link href={ROUTES.MESSAGES}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {/* Notifications - Click to go to notifications page */}
                    <Link href={ROUTES.NOTIFICATIONS}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground relative"
                      >
                        <Bell className="h-3.5 w-3.5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </Link>

                    {/* User menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 pl-1.5 pr-2 rounded-lg"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-[10px] font-semibold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden xl:inline text-sm font-medium">
                            {profile?.first_name || "Account"}
                          </span>
                          <ChevronDown className="hidden xl:block h-3 w-3 opacity-40" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={12}
                        className={dropdownClass}
                        style={{
                          maxHeight: "calc(100vh - 80px)",
                          overflowY: "auto",
                        }}
                      >
                        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {profile?.first_name} {profile?.last_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {profile?.email}
                            </p>
                          </div>
                        </div>

                        <div className="p-1.5">
                          <MenuLink
                            href={ROUTES.DASHBOARD}
                            icon={<LayoutGrid className="h-3.5 w-3.5" />}
                          >
                            Dashboard
                          </MenuLink>
                          <MenuLink
                            href={ROUTES.PROFILE}
                            icon={<User className="h-3.5 w-3.5" />}
                          >
                            Profile
                          </MenuLink>
                        </div>

                        {isBuyer && (
                          <>
                            <div className="h-px bg-border/50" />
                            <div className="p-1.5">
                              <p className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                Buyer
                              </p>
                              <MenuLink
                                href={ROUTES.BUYER_REQUESTS}
                                icon={<FileText className="h-3.5 w-3.5" />}
                              >
                                My Requests
                              </MenuLink>
                              <MenuLink
                                href={ROUTES.BUYER_REQUEST_CREATE}
                                icon={<Plus className="h-3.5 w-3.5" />}
                              >
                                Post Request
                              </MenuLink>
                              <MenuLink
                                href={ROUTES.BUYER_ORDERS}
                                icon={<ShoppingBag className="h-3.5 w-3.5" />}
                              >
                                My Orders
                              </MenuLink>
                              <MenuLink
                                href={ROUTES.BUYER_REVIEWS}
                                icon={<Star className="h-3.5 w-3.5" />}
                              >
                                My Reviews
                              </MenuLink>
                            </div>
                          </>
                        )}

                        {isSeller && (
                          <>
                            <div className="h-px bg-border/50" />
                            <div className="p-1.5">
                              <p className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                                Seller
                              </p>
                              <MenuLink
                                href={ROUTES.SELLER_PRODUCTS}
                                icon={<Package className="h-3.5 w-3.5" />}
                              >
                                My Products
                              </MenuLink>
                              <MenuLink
                                href={ROUTES.SELLER_PRODUCT_CREATE}
                                icon={<Plus className="h-3.5 w-3.5" />}
                              >
                                Add Product
                              </MenuLink>
                  
                              <MenuLink
                                href={ROUTES.SELLER_ORDERS}
                                icon={<ShoppingBag className="h-3.5 w-3.5" />}
                              >
                                Incoming Orders
                              </MenuLink>
                            </div>
                          </>
                        )}

                        <div className="h-px bg-border/50" />
                        <div className="p-1.5">
                          <DropdownMenuItem
                            onClick={handleSignOut}
                            className="rounded-lg gap-2 text-sm text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Mobile controls */}
              <div className="flex items-center gap-1 md:hidden">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/60 [backdrop-filter:blur(4px)]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bottom-0 bg-background/95 [backdrop-filter:blur(20px)_saturate(150%)] border-t border-border/40 overflow-y-auto">
            <div className="px-4 pt-4 pb-8 space-y-0.5">
              {/* Mobile search */}
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 px-3 h-10 mb-4 rounded-lg border border-border/50 bg-muted/30"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground/50"
                />
              </form>

              {/* Main links */}
              {NAV_LINKS.map(({ label, href, exact }) => {
                const active = isActive(href, exact);
                return (
                  <MobileNavItem
                    key={href}
                    href={href}
                    active={active}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </MobileNavItem>
                );
              })}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !user ? (
                <div className="pt-5 flex flex-col gap-2">
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-border/60"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href={ROUTES.SIGNUP}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full rounded-lg bg-foreground text-background hover:bg-foreground/90">
                      Get Started
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <MobileSection label="Account">
                    <MobileNavItem
                      href={ROUTES.DASHBOARD}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </MobileNavItem>
                    <MobileNavItem
                      href={ROUTES.PROFILE}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </MobileNavItem>
                    <MobileNavItem
                      href={ROUTES.MESSAGES}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages
                    </MobileNavItem>
                    <MobileNavItem
                      href={ROUTES.NOTIFICATIONS}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </MobileNavItem>
                  </MobileSection>

                  {isBuyer && (
                    <MobileSection label="Buyer">
                      <MobileNavItem
                        href={ROUTES.BUYER_REQUESTS}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Requests
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.BUYER_REQUEST_CREATE}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Post Request
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.BUYER_ORDERS}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.BUYER_REVIEWS}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Reviews
                      </MobileNavItem>
                    </MobileSection>
                  )}

                  {isSeller && (
                    <MobileSection label="Seller">
                      <MobileNavItem
                        href={ROUTES.SELLER_PRODUCTS}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Products
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.SELLER_PRODUCT_CREATE}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Add Product
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.SELLER_EXPLORE}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Browse Requests
                      </MobileNavItem>
                      <MobileNavItem
                        href={ROUTES.SELLER_ORDERS}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Incoming Orders
                      </MobileNavItem>
                    </MobileSection>
                  )}

                  {/* User footer */}
                  <div className="pt-4 mt-2 border-t border-border/40 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/30">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="rounded-lg gap-2 text-sm cursor-pointer"
    >
      <Link href={href}>
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </Link>
    </DropdownMenuItem>
  );
}

function MobileNavItem({
  href,
  onClick,
  active,
  children,
}: {
  href: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
      }`}
    >
      {children}
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
      )}
    </Link>
  );
}

function MobileSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-4">
      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
        {label}
      </p>
      {children}
    </div>
  );
}
