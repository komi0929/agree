"use client";

import { useState, useEffect } from "react";
// import { useAuth } from "@/lib/auth/auth-context"; // Removed Auth
// import { supabase } from "@/lib/auth/supabase-client"; // Removed Auth
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";

interface HistoryItem {
    id: string;
    title: string;
    contract_type: string | null;
    created_at: string;
}

// import { AuthModal, UserMenu } from "@/components/auth/auth-modal"; // Removed Auth

interface HistorySidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSelectHistory: (historyId: string) => void;
    onNewAnalysis: () => void;
    currentHistoryId?: string;
    // onLoginClick?: () => void; // Removed
}

export function HistorySidebar({
    isOpen,
    onToggle,
    onSelectHistory,
    onNewAnalysis,
    currentHistoryId,
}: HistorySidebarProps) {
    // const { user, session } = useAuth(); // Removed
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Auth-based history fetching disabled for now
    /*
    useEffect(() => {
        if (user && session) {
            fetchHistory();
        }
    }, [user, session]);
    */

    /*
    const fetchHistory = async () => {
       // ... removed
    };
    */

    const deleteHistory = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Disabled
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "今日";
        if (diffDays === 1) return "昨日";
        if (diffDays < 7) return `${diffDays}日前`;
        return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
    };


    return (
        <>
            {/* Toggle button when closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-l-0 border-primary/20 rounded-r-lg p-2 shadow-md hover:bg-primary/5 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-primary" />
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full bg-background border-r border-primary/10 z-50 transition-all duration-300 flex flex-col shadow-sm ${isOpen ? "w-72" : "w-0 overflow-hidden"
                    }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-primary/10 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <h2 className="font-semibold text-primary text-sm tracking-tight">契約書チェック履歴</h2>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-primary" />
                    </button>
                </div>

                {/* New Analysis Button */}
                <div className="p-4 flex-shrink-0">
                    <button
                        onClick={onNewAnalysis}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-primary/20 text-primary rounded-full hover:bg-primary/5 hover:border-primary/40 transition-all font-medium text-sm shadow-sm active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4 text-primary" />
                        新たな契約書をチェック
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    {/* Temporarily showing "Coming Soon" or Empty State since db auth is removed */}
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
                        履歴機能は現在調整中です
                    </div>
                </div>

                {/* Footer - Copyright or Link */}
                <div className="p-4 border-t border-primary/10 flex-shrink-0 bg-white/50 backdrop-blur-sm">
                    <div className="text-[10px] text-center text-slate-400">
                        © 2026 Agree
                    </div>
                </div>
            </div>
        </>
    );
}

// Hook for history operations
export function useAnalysisHistory() {
    // const { session } = useAuth(); // Removed

    const saveToHistory = async (
        title: string,
        contractText: string,
        analysisResult: EnhancedAnalysisResult,
        contractType?: string
    ): Promise<string | null> => {
        // Disabled
        return null;
    };

    const loadFromHistory = async (
        historyId: string
    ): Promise<{
        contractText: string;
        analysisResult: EnhancedAnalysisResult;
        contractType?: string;
    } | null> => {
        // Disabled
        return null;
    };

    return { saveToHistory, loadFromHistory };
}


