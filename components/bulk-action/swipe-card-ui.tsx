"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { EnhancedRisk } from "@/lib/types/analysis";
import { Check, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeCardUIProps {
    risks: EnhancedRisk[];
    onAccept: (index: number) => void;
    onReject: (index: number) => void;
    onSkip: (index: number) => void;
    acceptedIndices: number[];
    rejectedIndices: number[];
}

export function SwipeCardUI({
    risks,
    onAccept,
    onReject,
    onSkip,
    acceptedIndices,
    rejectedIndices,
}: SwipeCardUIProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const startY = useRef(0);
    const currentX = useRef(0);
    const currentY = useRef(0);

    // Get unprocessed risks
    const unprocessedIndices = risks
        .map((_, i) => i)
        .filter(i => !acceptedIndices.includes(i) && !rejectedIndices.includes(i));

    const currentRiskIndex = unprocessedIndices[currentIndex] ?? -1;
    const currentRisk = currentRiskIndex >= 0 ? risks[currentRiskIndex] : null;

    const handleAccept = useCallback(() => {
        if (currentRiskIndex >= 0) {
            setSwipeDirection("right");
            setTimeout(() => {
                onAccept(currentRiskIndex);
                setSwipeDirection(null);
                setCurrentIndex(prev => Math.min(prev, unprocessedIndices.length - 2));
            }, 300);
        }
    }, [currentRiskIndex, onAccept, unprocessedIndices.length]);

    const handleReject = useCallback(() => {
        if (currentRiskIndex >= 0) {
            setSwipeDirection("left");
            setTimeout(() => {
                onReject(currentRiskIndex);
                setSwipeDirection(null);
                setCurrentIndex(prev => Math.min(prev, unprocessedIndices.length - 2));
            }, 300);
        }
    }, [currentRiskIndex, onReject, unprocessedIndices.length]);

    const handleSkip = useCallback(() => {
        if (currentRiskIndex >= 0) {
            setSwipeDirection("up");
            setTimeout(() => {
                onSkip(currentRiskIndex);
                setSwipeDirection(null);
                setCurrentIndex(prev => prev + 1);
            }, 300);
        }
    }, [currentRiskIndex, onSkip]);

    // Touch/Mouse handlers for swipe
    const handleStart = (clientX: number, clientY: number) => {
        startX.current = clientX;
        startY.current = clientY;
    };

    const handleMove = (clientX: number, clientY: number) => {
        currentX.current = clientX - startX.current;
        currentY.current = clientY - startY.current;
        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${currentX.current}px, ${currentY.current}px) rotate(${currentX.current * 0.05}deg)`;
        }
    };

    const handleEnd = () => {
        const threshold = 100;
        if (currentX.current > threshold) {
            handleAccept();
        } else if (currentX.current < -threshold) {
            handleReject();
        } else if (currentY.current < -threshold) {
            handleSkip();
        } else {
            // Reset position
            if (cardRef.current) {
                cardRef.current.style.transform = "";
            }
        }
        currentX.current = 0;
        currentY.current = 0;
    };

    const getRiskLevelColor = (level?: string) => {
        switch (level) {
            case "critical": return "border-red-500 bg-red-50";
            case "high": return "border-orange-500 bg-orange-50";
            case "medium": return "border-yellow-500 bg-yellow-50";
            default: return "border-blue-500 bg-blue-50";
        }
    };

    const getRiskLevelBadge = (level?: string) => {
        switch (level) {
            case "critical": return "bg-red-100 text-red-700";
            case "high": return "bg-orange-100 text-orange-700";
            case "medium": return "bg-yellow-100 text-yellow-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    if (unprocessedIndices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">すべて確認完了！</h3>
                <p className="text-sm text-muted-foreground">
                    採用: {acceptedIndices.length}件 / 却下: {rejectedIndices.length}件
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 py-6">
            {/* Progress */}
            <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{currentIndex + 1}</span>
                <span> / {unprocessedIndices.length}</span>
                <span className="text-xs ml-2">
                    (採用: {acceptedIndices.length} / 却下: {rejectedIndices.length})
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((acceptedIndices.length + rejectedIndices.length) / risks.length) * 100}%` }}
                />
            </div>

            {/* Card Stack */}
            <div className="relative w-full max-w-md h-80">
                {currentRisk && (
                    <div
                        ref={cardRef}
                        className={cn(
                            "absolute inset-0 rounded-2xl border-2 shadow-lg p-6 cursor-grab active:cursor-grabbing transition-transform",
                            getRiskLevelColor(currentRisk.risk_level),
                            swipeDirection === "left" && "translate-x-[-150%] rotate-[-30deg] opacity-0",
                            swipeDirection === "right" && "translate-x-[150%] rotate-[30deg] opacity-0",
                            swipeDirection === "up" && "translate-y-[-150%] opacity-0"
                        )}
                        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                        onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX, e.clientY)}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={handleEnd}
                    >
                        {/* Risk Level Badge */}
                        <div className={cn("inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-3", getRiskLevelBadge(currentRisk.risk_level))}>
                            {currentRisk.risk_level}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                            {currentRisk.section_title}
                        </h3>

                        {/* Explanation */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                            {currentRisk.explanation}
                        </p>

                        {/* Suggestion */}
                        {currentRisk.suggestion?.revised_text && (
                            <div className="bg-white/80 rounded-lg p-3 border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1">修正案:</p>
                                <p className="text-sm text-foreground line-clamp-2">
                                    {currentRisk.suggestion.revised_text}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16 rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                    onClick={handleReject}
                >
                    <X className="w-8 h-8" />
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-12 h-12 rounded-full border-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                    onClick={handleSkip}
                >
                    <RotateCcw className="w-5 h-5" />
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="w-16 h-16 rounded-full border-2 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-500"
                    onClick={handleAccept}
                >
                    <Check className="w-8 h-8" />
                </Button>
            </div>

            {/* Instructions */}
            <div className="text-center text-xs text-muted-foreground">
                <p>← 却下 ・ ↑ 後で ・ 採用 →</p>
                <p className="mt-1">カードをスワイプするか、ボタンで操作</p>
            </div>
        </div>
    );
}
