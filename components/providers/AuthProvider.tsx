'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
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
  initialProfile 
}: { 
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setUser(initialUser);
    setProfile(initialProfile);
  }, [initialUser, initialProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      setLoading(false);

      if (authUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { signOut } = await import('@/app/actions/auth');
      await signOut();
      setUser(null);
      setProfile(null);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signOut,
      isAuthenticated: !!user,
      isBuyer: profile?.user_type === 'buyer' || profile?.user_type === 'both',
      isSeller: profile?.user_type === 'seller' || profile?.user_type === 'both',
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
