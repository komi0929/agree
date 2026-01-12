"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/auth/supabase-client";
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";

interface HistoryItem {
    id: string;
    title: string;
    contract_type: string | null;
    created_at: string;
}

import { AuthModal, UserMenu } from "@/components/auth/auth-modal";

interface HistorySidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSelectHistory: (historyId: string) => void;
    onNewAnalysis: () => void;
    currentHistoryId?: string;
    onLoginClick?: () => void;
}

export function HistorySidebar({
    isOpen,
    onToggle,
    onSelectHistory,
    onNewAnalysis,
    currentHistoryId,
    onLoginClick,
}: HistorySidebarProps) {
    const { user, session } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && session) {
            fetchHistory();
        }
    }, [user, session]);

    const fetchHistory = async () => {
        if (!session?.access_token) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/history", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHistory = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session?.access_token) return;

        try {
            const response = await fetch(`/api/history/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                setHistory(prev => prev.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete history:", error);
        }
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
                    {!user ? (
                        // Non-logged-in: Show placeholder with lock icon
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
                            <p className="text-xs">端末に保存済み</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            読み込み中...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
                            履歴がありません
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectHistory(item.id)}
                                    className={`w-full text-left p-3 rounded-xl transition-colors group ${currentHistoryId === item.id
                                        ? "bg-primary/10"
                                        : "hover:bg-primary/5"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentHistoryId === item.id ? "text-primary" : "text-muted-foreground"}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${currentHistoryId === item.id ? "text-primary" : "text-foreground"}`}>
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.contract_type && `${item.contract_type} · `}
                                                {formatDate(item.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteHistory(item.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                        </button>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Different content based on auth state */}
                <div className="p-4 border-t border-primary/10 flex-shrink-0 bg-white/50 backdrop-blur-sm">
                    {user ? (
                        // Logged in: Show history count and user menu
                        <>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <span className="text-[10px] uppercase font-bold text-primary/50 tracking-widest">
                                    {history.length}件の履歴
                                </span>
                            </div>
                            <UserMenu />
                        </>
                    ) : (
                        // Not logged in: Show login CTA
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                登録すれば履歴を保存できます
                            </p>
                            <Button
                                onClick={onLoginClick}
                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full font-medium"
                            >
                                無料ではじめる
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// Hook for history operations
export function useAnalysisHistory() {
    const { session } = useAuth();

    const saveToHistory = async (
        title: string,
        contractText: string,
        analysisResult: EnhancedAnalysisResult,
        contractType?: string
    ): Promise<string | null> => {
        if (!session?.access_token) return null;

        try {
            const response = await fetch("/api/history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    title,
                    contract_text: contractText,
                    analysis_result: analysisResult,
                    contract_type: contractType,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.history?.id || null;
            }
        } catch (error) {
            console.error("Failed to save history:", error);
        }
        return null;
    };

    const loadFromHistory = async (
        historyId: string
    ): Promise<{
        contractText: string;
        analysisResult: EnhancedAnalysisResult;
        contractType?: string;
    } | null> => {
        if (!session?.access_token) return null;

        try {
            const response = await fetch(`/api/history/${historyId}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    contractText: data.history.contract_text,
                    analysisResult: data.history.analysis_result,
                    contractType: data.history.contract_type,
                };
            }
        } catch (error) {
            console.error("Failed to load history:", error);
        }
        return null;
    };

    return { saveToHistory, loadFromHistory };
}
