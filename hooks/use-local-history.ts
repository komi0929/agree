"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getRecentAnalyses,
    getAnalysis,
    getContractText,
    saveAnalysis,
    deleteAnalysis,
    isLocalStorageAvailable,
    StoredAnalysis
} from "@/lib/storage/local-history";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";

export interface UseLocalHistoryReturn {
    // Recent analyses list
    analyses: StoredAnalysis[];
    // Loading state
    isLoading: boolean;
    // Error state
    error: string | null;
    // Is IndexedDB available?
    isAvailable: boolean;
    // Refresh the list
    refresh: () => Promise<void>;
    // Save a new analysis
    save: (text: string, data: EnhancedAnalysisResult, contractType?: string) => Promise<string | null>;
    // Load a specific analysis (returns contract text too)
    load: (id: string) => Promise<{ analysis: StoredAnalysis; text: string } | null>;
    // Delete an analysis
    remove: (id: string) => Promise<void>;
}

/**
 * Hook for accessing local analysis history
 * Provides zero-latency history operations
 */
export function useLocalHistory(limit = 10): UseLocalHistoryReturn {
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAvailable] = useState(() => isLocalStorageAvailable());

    const refresh = useCallback(async () => {
        if (!isAvailable) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const results = await getRecentAnalyses(limit);
            setAnalyses(results);
        } catch (err) {
            setError("履歴の読み込みに失敗しました");
            console.error("Failed to load history:", err);
        } finally {
            setIsLoading(false);
        }
    }, [isAvailable, limit]);

    // Load on mount
    useEffect(() => {
        refresh();
    }, [refresh]);

    const save = useCallback(async (
        text: string,
        data: EnhancedAnalysisResult,
        contractType?: string
    ): Promise<string | null> => {
        if (!isAvailable) return null;

        try {
            const id = await saveAnalysis(text, data, contractType);
            await refresh(); // Refresh list after save
            return id;
        } catch (err) {
            console.error("Failed to save analysis:", err);
            return null;
        }
    }, [isAvailable, refresh]);

    const load = useCallback(async (id: string) => {
        if (!isAvailable) return null;

        try {
            const analysis = await getAnalysis(id);
            if (!analysis) return null;

            const text = await getContractText(analysis.contractHash);
            if (!text) return null;

            return { analysis, text };
        } catch (err) {
            console.error("Failed to load analysis:", err);
            return null;
        }
    }, [isAvailable]);

    const remove = useCallback(async (id: string) => {
        if (!isAvailable) return;

        try {
            await deleteAnalysis(id);
            await refresh(); // Refresh list after delete
        } catch (err) {
            console.error("Failed to delete analysis:", err);
        }
    }, [isAvailable, refresh]);

    return {
        analyses,
        isLoading,
        error,
        isAvailable,
        refresh,
        save,
        load,
        remove,
    };
}
