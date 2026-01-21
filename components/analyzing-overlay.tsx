"use client";

import { Check, Loader2, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AnalysisStep {
    id: string;
    label: string;
    description: string;
    duration: number;
}

const ANALYSIS_STEPS: AnalysisStep[] = [
    { id: "read", label: "契約書を受け取りました！", description: "内容を確認中...", duration: 2000 },
    { id: "analyze", label: "条項をチェックしています", description: "リーガルチェック実行中", duration: 4000 },
    { id: "detect", label: "重要なポイントを整理しています", description: "懸念事項を特定中", duration: 5000 },
    { id: "suggest", label: "レポートを作成しています！", description: "アドバイスを作成中", duration: 3000 },
];

interface AnalyzingOverlayProps {
    isActive: boolean;
    loadingMessage?: string;
    onCancel?: () => void;
}

/**
 * Full-screen overlay loading UI - no page transition needed
 * Shows step-by-step progress animation with a translucent backdrop
 */
export function AnalyzingOverlay({ isActive, loadingMessage, onCancel }: AnalyzingOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(() => Date.now());

    // Reset on activation
    useEffect(() => {
        if (isActive) {
            setCurrentStep(0);
            setElapsedTime(0);
            setStartTime(Date.now());
        }
    }, [isActive]);

    // Progress through steps automatically
    useEffect(() => {
        if (!isActive) {
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
            if (index > 0) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-white/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Content Card */}
            <div className="relative bg-white rounded-2xl border border-primary/20 shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                {/* Cancel button */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Header with timer */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-medium text-primary">確認中です。少々お待ちください...</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
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
                                    "flex items-center gap-3 py-2 transition-all duration-300",
                                    isComplete && "text-muted-foreground",
                                    isCurrent && "text-primary",
                                    isPending && "text-muted-foreground/50"
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

                {/* Loading message */}
                {loadingMessage && (
                    <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-xs text-muted-foreground text-center">{loadingMessage}</p>
                    </div>
                )}

                {/* Tips section */}
                <div className="mt-6 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs text-muted-foreground text-center">
                        💡 通常10〜15秒ほどで完了します！
                    </p>
                </div>
            </div>
        </div>
    );
}
