"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Home, Settings, ShoppingBag, Plus, Package } from "lucide-react"

export default function DashboardNav({ user, profile }: any) {
  const router = useRouter()

  const handleLogout = async () => {
    // Note: Logout functionality requires a route handler
    // For now, users will need to implement this with auth.signOut()
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">RevCom</div>
        </Link>

        <div className="flex gap-2 items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>

          {(profile?.user_type === "buyer" || profile?.user_type === "both") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Buyer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Buyer Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/buyer/listings" className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/buyer/orders" className="cursor-pointer">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {(profile?.user_type === "seller" || profile?.user_type === "both") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Seller
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Seller Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/seller/explore" className="cursor-pointer">
                    Explore Requests
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/seller/orders" className="cursor-pointer">
                    <Package className="w-4 h-4 mr-2" />
                    Incoming Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link href="/messages">
            <Button variant="ghost" size="sm">
              Messages
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Profile
            </Button>
          </Link>

          <Button variant="destructive" size="sm" className="gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
