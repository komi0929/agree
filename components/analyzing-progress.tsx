"use client";

import { Check, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnalysisStep {
    id: string;
    label: string;
    description: string;
    duration: number; // Expected duration in ms
}

const ANALYSIS_STEPS: AnalysisStep[] = [
    { id: "read", label: "契約書を解析しています", description: "データの読み込み中", duration: 2000 },
    { id: "analyze", label: "条項を精査しています", description: "リーガルチェック実行中", duration: 4000 },
    { id: "detect", label: "リスクポイントを整理しています", description: "懸念事項を特定中", duration: 5000 },
    { id: "suggest", label: "診断レポートを生成しています", description: "アドバイスを作成中", duration: 3000 },
];

interface AnalyzingProgressProps {
    isActive: boolean;
    loadingMessage?: string;
}

/**
 * Progressive loading UI for non-streaming analysis
 * Shows step-by-step progress animation
 */
export function AnalyzingProgress({ isActive, loadingMessage }: AnalyzingProgressProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime] = useState(() => Date.now());

    // Progress through steps automatically
    useEffect(() => {
        if (!isActive) {
            setCurrentStep(0);
            setElapsedTime(0);
            return;
        }

        // Timer for elapsed time
        const timerInterval = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 100);

        // Auto-advance steps based on timing
        let totalDuration = 0;
        const timeouts: NodeJS.Timeout[] = [];

        ANALYSIS_STEPS.forEach((step, index) => {
            if (index > 0) { // Start from step 0
                totalDuration += ANALYSIS_STEPS[index - 1].duration;
                const timeout = setTimeout(() => {
                    setCurrentStep(index);
                }, totalDuration);
                timeouts.push(timeout);
            }
        });

        return () => {
            clearInterval(timerInterval);
            timeouts.forEach(t => clearTimeout(t));
        };
    }, [isActive, startTime]);

    // Format elapsed time
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const tenths = Math.floor((ms % 1000) / 100);
        return `${seconds}.${tenths}秒`;
    };

    // Calculate progress percentage
    const progress = Math.min((currentStep + 1) / ANALYSIS_STEPS.length * 100, 95);

    if (!isActive) return null;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with timer */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-medium text-slate-700">確認しています...</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatTime(elapsedTime)}
                </div>
            </div>

            {/* Progress bar - subtle single color */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-slate-600 transition-all duration-500 ease-out"
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
                                isComplete && "text-slate-600",
                                isCurrent && "text-slate-800",
                                isPending && "text-slate-300"
                            )}
                        >
                            {/* Icon */}
                            <div className="w-5 h-5 flex items-center justify-center">
                                {isComplete && <Check className="w-4 h-4" />}
                                {isCurrent && <Loader2 className="w-4 h-4 animate-spin" />}
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

            {/* Loading message */}
            {loadingMessage && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 text-center">{loadingMessage}</p>
                </div>
            )}
        </div>
    );
}
