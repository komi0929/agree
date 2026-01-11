"use client";

import { Check, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamingState } from "@/hooks/use-streaming-analysis";

interface AnalysisStep {
    id: string;
    label: string;
    description: string;
}

const ANALYSIS_STEPS: AnalysisStep[] = [
    { id: "connect", label: "接続中", description: "サーバーに接続" },
    { id: "analyze", label: "内容を確認中", description: "契約書の内容を確認" },
    { id: "detect", label: "気になる点を整理中", description: "ポイントを特定" },
    { id: "suggest", label: "ご報告を準備中", description: "まとめを作成" },
];

interface StreamingProgressProps {
    state: StreamingState;
    progress: number;
    elapsedTime: number;
    rawContent?: string;
}

export function StreamingProgress({ state, progress, elapsedTime, rawContent }: StreamingProgressProps) {
    // Determine current step based on progress
    const getCurrentStep = () => {
        if (state === "connecting") return 0;
        if (progress < 20) return 1;
        if (progress < 60) return 2;
        if (progress < 90) return 3;
        return 4;
    };

    const currentStep = getCurrentStep();

    // Format elapsed time
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}秒`;
    };

    if (state === "idle" || state === "complete" || state === "error") {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl border border-primary/20 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with timer */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-medium text-primary">確認しています...</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(elapsedTime)}
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                    const isComplete = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3 py-2 transition-all",
                                isComplete && "text-muted-foreground",
                                isCurrent && "text-primary",
                                isPending && "text-muted-foreground/50 text-slate-300"
                            )}
                        >
                            {/* Icon */}
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isComplete && <Check className="w-4 h-4" />}
                                {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                {isPending && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <span className={cn(
                                    "text-sm",
                                    isCurrent && "font-medium"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live content preview (optional - shows AI is working) */}
            {rawContent && rawContent.length > 10 && state === "streaming" && (
                <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="text-xs text-muted-foreground mb-2">AIからの応答:</p>
                    <div className="text-xs text-muted-foreground font-mono bg-primary/5 rounded p-2 max-h-20 overflow-hidden">
                        {rawContent.slice(-150)}
                        <span className="animate-pulse">▌</span>
                    </div>
                </div>
            )}
        </div>
    );
}
