"use client";

import { useState, useCallback } from "react";
import { EnhancedRisk } from "@/lib/types/analysis";
import { SwipeCardUI } from "./swipe-card-ui";
import { BatchSelectUI } from "./batch-select-ui";
import { KanbanBoardUI } from "./kanban-board-ui";
import { Layers, ListChecks, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BulkActionMode = "swipe" | "batch" | "kanban";

interface BulkActionContainerProps {
    risks: EnhancedRisk[];
    onComplete: (acceptedIndices: number[], rejectedIndices: number[]) => void;
    onClose: () => void;
}

const MODE_OPTIONS: { mode: BulkActionMode; icon: React.ReactNode; label: string; description: string }[] = [
    {
        mode: "swipe",
        icon: <Layers className="w-4 h-4" />,
        label: "スワイプ",
        description: "1件ずつ確認"
    },
    {
        mode: "batch",
        icon: <ListChecks className="w-4 h-4" />,
        label: "一括選択",
        description: "複数選択して処理"
    },
    {
        mode: "kanban",
        icon: <LayoutGrid className="w-4 h-4" />,
        label: "カンバン",
        description: "ドラッグ＆ドロップ"
    },
];

export function BulkActionContainer({ risks, onComplete, onClose }: BulkActionContainerProps) {
    const [mode, setMode] = useState<BulkActionMode>("batch");
    const [acceptedIndices, setAcceptedIndices] = useState<number[]>([]);
    const [rejectedIndices, setRejectedIndices] = useState<number[]>([]);

    const handleAccept = useCallback((indexOrIndices: number | number[]) => {
        const indices = Array.isArray(indexOrIndices) ? indexOrIndices : [indexOrIndices];
        setAcceptedIndices(prev => [...new Set([...prev, ...indices])]);
        // Remove from rejected if previously rejected
        setRejectedIndices(prev => prev.filter(i => !indices.includes(i)));
    }, []);

    const handleReject = useCallback((indexOrIndices: number | number[]) => {
        const indices = Array.isArray(indexOrIndices) ? indexOrIndices : [indexOrIndices];
        setRejectedIndices(prev => [...new Set([...prev, ...indices])]);
        // Remove from accepted if previously accepted
        setAcceptedIndices(prev => prev.filter(i => !indices.includes(i)));
    }, []);

    const handleReset = useCallback((index: number) => {
        setAcceptedIndices(prev => prev.filter(i => i !== index));
        setRejectedIndices(prev => prev.filter(i => i !== index));
    }, []);

    const handleSkip = useCallback((index: number) => {
        // Skip doesn't change state, just moves to next in swipe mode
    }, []);

    const handleFinish = () => {
        onComplete(acceptedIndices, rejectedIndices);
    };

    const progress = ((acceptedIndices.length + rejectedIndices.length) / risks.length) * 100;
    const isAllProcessed = acceptedIndices.length + rejectedIndices.length === risks.length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">一括処理モード</h2>
                        <p className="text-sm text-muted-foreground">
                            {risks.length}件の指摘を効率的に確認・採択できます
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Mode Switcher */}
                <div className="px-6 py-3 border-b bg-slate-50 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-2">表示モード:</span>
                    {MODE_OPTIONS.map(({ mode: m, icon, label, description }) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm",
                                mode === m
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                            )}
                        >
                            {icon}
                            <span className="font-medium">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {mode === "swipe" && (
                        <SwipeCardUI
                            risks={risks}
                            onAccept={(i) => handleAccept(i)}
                            onReject={(i) => handleReject(i)}
                            onSkip={handleSkip}
                            acceptedIndices={acceptedIndices}
                            rejectedIndices={rejectedIndices}
                        />
                    )}
                    {mode === "batch" && (
                        <BatchSelectUI
                            risks={risks}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            acceptedIndices={acceptedIndices}
                            rejectedIndices={rejectedIndices}
                        />
                    )}
                    {mode === "kanban" && (
                        <KanbanBoardUI
                            risks={risks}
                            onAccept={(i) => handleAccept(i)}
                            onReject={(i) => handleReject(i)}
                            onReset={handleReset}
                            acceptedIndices={acceptedIndices}
                            rejectedIndices={rejectedIndices}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Progress bar */}
                        <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}% 完了
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={onClose}>
                            キャンセル
                        </Button>
                        <Button
                            onClick={handleFinish}
                            className="bg-primary hover:bg-primary/90"
                            disabled={acceptedIndices.length === 0 && rejectedIndices.length === 0}
                        >
                            確定する（{acceptedIndices.length}件採用）
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
