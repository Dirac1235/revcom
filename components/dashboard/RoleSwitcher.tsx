"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Store, 
  Bell, 
  Menu,
  ChevronDown 
} from "lucide-react";
import Link from "next/link";

interface RoleSwitcherProps {
  onRoleChange?: (role: 'buyer' | 'seller') => void;
}

export function RoleSwitcher({ onRoleChange }: RoleSwitcherProps) {
  const { profile } = useAuth();
  const [activeRole, setActiveRole] = useState<'buyer' | 'seller'>('buyer');

  const handleRoleChange = (role: 'buyer' | 'seller') => {
    setActiveRole(role);
    onRoleChange?.(role);
  };

  if (!profile || profile.user_type !== 'both') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
      <button
        onClick={() => handleRoleChange('buyer')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeRole === 'buyer'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User className="w-4 h-4" />
        Buyer
      </button>
      <button
        onClick={() => handleRoleChange('seller')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeRole === 'seller'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Store className="w-4 h-4" />
        Seller
      </button>
    </div>
  );
}

export function DashboardHeader() {
  const { profile, user } = useAuth();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.first_name || 'there'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        
        <Link href="/profile">
          <div className="flex items-center gap-2 hover:bg-secondary px-3 py-2 rounded-full transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
              {profile?.first_name?.[0] || profile?.email?.[0] || 'U'}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
