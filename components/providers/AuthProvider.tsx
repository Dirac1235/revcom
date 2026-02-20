"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isReady: boolean; // New: indicates auth check is complete
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check auth state on mount - ALWAYS run this
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("[AuthProvider] Initializing auth...");
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      setSession(currentSession);
      
      if (currentSession?.user) {
        console.log("[AuthProvider] Session found, user:", currentSession.user.id);
        setUser(currentSession.user);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single();
        
        if (mounted) {
          setProfile(profileData);
        }
      } else if (initialUser) {
        // Use initial user from SSR if no session
        console.log("[AuthProvider] Using initialUser from SSR");
        setUser(initialUser);
        setProfile(initialProfile);
      } else {
        console.log("[AuthProvider] No session or initial user");
        setUser(null);
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
        setIsReady(true);
        console.log("[AuthProvider] Auth initialized, isReady:", true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [supabase, initialUser, initialProfile]);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[AuthProvider] Auth state changed:", event);
        
        setSession(currentSession);
        const authUser = currentSession?.user ?? null;
        setUser(authUser);

        if (authUser) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setIsReady(true);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { signOut } = await import("@/lib/actions/auth");
      await signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
    }
  }, [supabase, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isReady,
        signOut,
        isAuthenticated: !!user,
        isBuyer: profile?.user_type === "buyer" || profile?.user_type === "both",
        isSeller: profile?.user_type === "seller" || profile?.user_type === "both",
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
