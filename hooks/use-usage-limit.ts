"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
    getAnonymousCheckCount,
    getAnonymousRemainingChecks,
    hasAnonymousReachedCheckLimit,
    incrementAnonymousCheckCount,
    ANONYMOUS_CHECK_LIMIT,
    REGISTERED_CHECK_LIMIT,
    REGISTERED_GENERATION_LIMIT,
} from "@/lib/storage/anonymous-usage";

// ========================================
// 🔧 TESTING MODE - 使用回数制限を一時停止
// 復旧時は false に戻してください
// ========================================
const TESTING_MODE = true;

// Admin emails with unlimited access (comma-separated in env var)
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

export type UserPlan = "anonymous" | "registered" | "admin";

export interface UsageState {
    plan: UserPlan;
    isRegistered: boolean;
    isAdmin: boolean;
    // Check limits
    checkCount: number;
    checkLimit: number;
    checkRemaining: number;
    hasReachedCheckLimit: boolean;
    // Generation limits (registered only)
    generationCount: number;
    generationLimit: number;
    generationRemaining: number;
    hasReachedGenerationLimit: boolean;
    // Loading
    isLoading: boolean;
}

/**
 * Hook for user tier and usage limit management
 * 
 * Limits:
 * - Anonymous: 3 checks/month, no generation
 * - Registered: 10 checks/month, 5 generations/month
 * 
 * NOTE: TESTING_MODE=true bypasses all limits
 */
export function useUsageLimit(): UsageState & {
    incrementCheckCount: () => Promise<boolean>;
    incrementGenerationCount: () => Promise<boolean>;
    refreshUsage: () => Promise<void>;
} {
    const { user, session } = useAuth();
    const [checkCount, setCheckCount] = useState(0);
    const [generationCount, setGenerationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const isRegistered = !!user;
    // TESTING_MODE makes everyone an "admin" effectively
    const isAdmin = TESTING_MODE || (user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false);
    const plan: UserPlan = isAdmin ? "admin" : isRegistered ? "registered" : "anonymous";

    // Limits based on plan (admin/testing = unlimited)
    const checkLimit = isAdmin ? Infinity : isRegistered ? REGISTERED_CHECK_LIMIT : ANONYMOUS_CHECK_LIMIT;
    const generationLimit = isAdmin ? Infinity : isRegistered ? REGISTERED_GENERATION_LIMIT : 0;

    // Calculated values - TESTING_MODE always returns 0 for hasReached
    const checkRemaining = Math.max(0, checkLimit - checkCount);
    const hasReachedCheckLimit = TESTING_MODE ? false : checkCount >= checkLimit;
    const generationRemaining = Math.max(0, generationLimit - generationCount);
    const hasReachedGenerationLimit = TESTING_MODE ? false : generationCount >= generationLimit;

    const loadUsage = useCallback(async () => {
        setIsLoading(true);

        if (!isRegistered) {
            // Anonymous user - use localStorage
            setCheckCount(getAnonymousCheckCount());
            setGenerationCount(0); // Anonymous can't generate
        } else if (session?.access_token) {
            // Registered user - fetch from server
            try {
                const response = await fetch("/api/usage", {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setCheckCount(data.checkCount || 0);
                    setGenerationCount(data.generationCount || 0);
                }
            } catch (error) {
                console.error("Failed to fetch usage:", error);
            }
        }

        setIsLoading(false);
    }, [isRegistered, session?.access_token]);

    useEffect(() => {
        loadUsage();
    }, [loadUsage]);

    const incrementCheckCount = async (): Promise<boolean> => {
        if (hasReachedCheckLimit) return false;

        if (!isRegistered) {
            const success = incrementAnonymousCheckCount();
            if (success) {
                setCheckCount(prev => prev + 1);
            }
            return success;
        } else if (session?.access_token) {
            try {
                const response = await fetch("/api/usage/increment-check", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (response.ok) {
                    setCheckCount(prev => prev + 1);
                    return true;
                }
            } catch (error) {
                console.error("Failed to increment check count:", error);
            }
            return false;
        }

        return false;
    };

    const incrementGenerationCount = async (): Promise<boolean> => {
        if (!isRegistered || hasReachedGenerationLimit) return false;

        if (session?.access_token) {
            try {
                const response = await fetch("/api/usage/increment-generation", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (response.ok) {
                    setGenerationCount(prev => prev + 1);
                    return true;
                }
            } catch (error) {
                console.error("Failed to increment generation count:", error);
            }
            return false;
        }

        return false;
    };

    return {
        plan,
        isRegistered,
        isAdmin,
        checkCount,
        checkLimit,
        checkRemaining,
        hasReachedCheckLimit,
        generationCount,
        generationLimit,
        generationRemaining,
        hasReachedGenerationLimit,
        isLoading,
        incrementCheckCount,
        incrementGenerationCount,
        refreshUsage: loadUsage,
    };
}
