"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured, UserProfile } from "./supabase-client";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isConfigured: boolean;
    signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    const fetchProfile = useCallback(async (userId: string) => {
        const client = getSupabaseClient();
        if (!client) return;

        const { data, error } = await client
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setProfile(data as UserProfile);
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    useEffect(() => {
        const client = getSupabaseClient();
        if (!client) {
            setIsLoading(false);
            return;
        }

        // Get initial session
        client.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signInWithEmail = async (email: string) => {
        const client = getSupabaseClient();
        if (!client) {
            return { error: new Error("Supabase not configured") };
        }

        const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

        const { error } = await client.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${redirectTo}/`,
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        const client = getSupabaseClient();
        if (client) {
            await client.auth.signOut();
        }
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isConfigured,
                signInWithEmail,
                signOut,
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
