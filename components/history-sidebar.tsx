"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/auth/supabase-client";
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";

interface HistoryItem {
    id: string;
    title: string;
    contract_type: string | null;
    created_at: string;
}

interface HistorySidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onSelectHistory: (historyId: string) => void;
    onNewAnalysis: () => void;
    currentHistoryId?: string;
}

export function HistorySidebar({
    isOpen,
    onToggle,
    onSelectHistory,
    onNewAnalysis,
    currentHistoryId,
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

    if (!user) return null;

    return (
        <>
            {/* Toggle button when closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-l-0 border-slate-200 rounded-r-lg p-2 shadow-md hover:bg-slate-50 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-full bg-slate-50 border-r border-slate-200 z-50 transition-all duration-300 flex flex-col ${isOpen ? "w-72" : "w-0 overflow-hidden"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <h2 className="font-semibold text-slate-800">診断履歴</h2>
                    <button
                        onClick={onToggle}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* New Analysis Button */}
                <div className="p-3 flex-shrink-0">
                    <button
                        onClick={onNewAnalysis}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        新しい診断
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">
                            読み込み中...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            履歴がありません
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectHistory(item.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors group ${currentHistoryId === item.id
                                            ? "bg-slate-200"
                                            : "hover:bg-slate-100"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {item.contract_type && `${item.contract_type} · `}
                                                {formatDate(item.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteHistory(item.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 flex-shrink-0">
                    <p className="text-xs text-slate-400 text-center">
                        {history.length}件の履歴
                    </p>
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
