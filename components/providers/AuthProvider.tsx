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
  isReady: boolean;
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
  // If SSR already gave us a user, we can start as ready/not-loading
  const [loading, setLoading] = useState(!initialUser);
  const [isReady, setIsReady] = useState(!!initialUser);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const applySession = async (currentSession: Session | null) => {
      const authUser = currentSession?.user ?? null;
      setSession(currentSession);
      setUser(authUser);

      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error("[AuthProvider] Profile fetch error:", profileError.message);
        }

        if (mounted) setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
        setIsReady(true);
      }
    };

    // Resolve initial session from storage/cookies. In production, onAuthStateChange
    // can fail to fire (e.g. SSR/cookie timing), so we must not rely on it alone.
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) await applySession(currentSession);
      } catch (err) {
        console.error("[AuthProvider] getSession error:", err);
        if (mounted) {
          setLoading(false);
          setIsReady(true);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      console.log(
        "[AuthProvider] Auth state changed:",
        event,
        "user:",
        currentSession?.user?.id ?? null
      );
      await applySession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      console.error("[AuthProvider] Error signing out:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("[AuthProvider] Error refreshing profile:", error.message);
      return;
    }

    setProfile(profileData ?? null);
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
        isBuyer:
          profile?.user_type === "buyer" || profile?.user_type === "both",
        isSeller:
          profile?.user_type === "seller" || profile?.user_type === "both",
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