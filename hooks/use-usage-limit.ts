"use client";

import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "@/lib/auth/auth-context";
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
    // Auth-less implementation
    const [checkCount, setCheckCount] = useState(0);
    const [generationCount, setGenerationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Always treat as anonymous (or admin if testing mode) to avoid auth dependencies
    const isRegistered = false;
    const isAdmin = TESTING_MODE;
    const plan: UserPlan = "anonymous";

    // Limits
    const checkLimit = isAdmin ? Infinity : ANONYMOUS_CHECK_LIMIT;
    const generationLimit = 0; // No generation for anonymous

    // Calculated values
    const checkRemaining = Math.max(0, checkLimit - checkCount);
    const hasReachedCheckLimit = TESTING_MODE ? false : checkCount >= checkLimit;
    const generationRemaining = 0;
    const hasReachedGenerationLimit = true;

    const loadUsage = useCallback(async () => {
        setIsLoading(true);
        // Always usage local storage for now
        setCheckCount(getAnonymousCheckCount());
        setGenerationCount(0);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadUsage();
    }, [loadUsage]);

    const incrementCheckCount = async (): Promise<boolean> => {
        if (hasReachedCheckLimit) return false;

        const success = incrementAnonymousCheckCount();
        if (success) {
            setCheckCount(prev => prev + 1);
        }
        return success;
    };

    const incrementGenerationCount = async (): Promise<boolean> => {
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
