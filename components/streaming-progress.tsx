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
    { id: "connect", label: "接続中", description: "AIサーバーに接続" },
    { id: "analyze", label: "解析中", description: "契約書の構造を分析" },
    { id: "detect", label: "検出中", description: "リスクポイントを特定" },
    { id: "suggest", label: "生成中", description: "修正案を作成" },
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with timer */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">AI解析中...</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(elapsedTime)}
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-2">
                {ANALYSIS_STEPS.map((step, index) => {
                    const isComplete = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-3 py-1.5 transition-all",
                                isComplete && "text-green-600",
                                isCurrent && "text-blue-600",
                                isPending && "text-slate-300"
                            )}
                        >
                            {/* Icon */}
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isComplete && <Check className="w-4 h-4" />}
                                {isCurrent && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isPending && <div className="w-2 h-2 rounded-full bg-current" />}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <span className={cn(
                                    "text-sm font-medium",
                                    isCurrent && "animate-pulse"
                                )}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="ml-2 text-xs text-slate-400">
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live content preview (optional - shows AI is working) */}
            {rawContent && rawContent.length > 10 && state === "streaming" && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2">AIからの応答:</p>
                    <div className="text-xs text-slate-500 font-mono bg-slate-50 rounded p-2 max-h-20 overflow-hidden">
                        {rawContent.slice(-150)}
                        <span className="animate-pulse">▌</span>
                    </div>
                </div>
            )}
        </div>
    );
}
