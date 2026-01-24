"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Copy, FileText, Check, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiffBottomSheet } from "./diff-bottom-sheet";

export type DiffType = "modified" | "added" | "deleted" | "risk_remaining";

export interface DiffMetadata {
    id: string;
    type: DiffType;
    startIndex: number;
    endIndex: number;
    originalText: string;
    correctedText: string;
    reason: string;
    riskLevel: "critical" | "high" | "medium" | "low";
}

interface CorrectedContractReaderProps {
    originalText: string;
    correctedText: string;
    diffs: DiffMetadata[];
    score?: number; // Added score prop
    onApplyDiff?: (diff: DiffMetadata) => void;
    onSkipDiff?: (diff: DiffMetadata) => void;
    onCopy?: () => void;
    onExportDocs?: () => void;
}

export function CorrectedContractReader({
    originalText,
    correctedText,
    diffs,
    score,
    onApplyDiff,
    onSkipDiff,
    onCopy,
    onExportDocs,
}: CorrectedContractReaderProps) {
    const [selectedDiff, setSelectedDiff] = useState<DiffMetadata | null>(null);
    const [copied, setCopied] = useState(false);

    // Parse corrected text and apply highlights
    const renderHighlightedText = useCallback(() => {
        if (diffs.length === 0) {
            return <span>{correctedText}</span>;
        }

        // Sort diffs by startIndex
        const sortedDiffs = [...diffs].sort((a, b) => a.startIndex - b.startIndex);

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedDiffs.forEach((diff, index) => {
            // Add text before this diff
            if (diff.startIndex > lastIndex) {
                elements.push(
                    <span key={`text-${index}`}>
                        {correctedText.slice(lastIndex, diff.startIndex)}
                    </span>
                );
            }

            // Add highlighted diff
            if (diff.type === "deleted") {
                // Show deletion badge
                elements.push(
                    <button
                        key={`diff-${diff.id}`}
                        onClick={() => setSelectedDiff(diff)}
                        className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded text-xs font-medium",
                            "bg-red-100 text-red-700 border border-red-200",
                            "hover:bg-red-200 transition-colors cursor-pointer"
                        )}
                    >
                        ⛔ 削除された条項
                    </button>
                );
            } else if (diff.type === "risk_remaining") {
                // Show remaining risk (red highlight)
                elements.push(
                    <button
                        key={`diff-${diff.id}`}
                        onClick={() => setSelectedDiff(diff)}
                        className={cn(
                            "highlight-risk-remaining",
                            "hover:bg-red-100 transition-colors cursor-pointer rounded px-0.5"
                        )}
                    >
                        {diff.originalText}
                    </button>
                );
            } else {
                // Show modified/added text
                const highlightClass = diff.type === "modified"
                    ? "highlight-modified"
                    : "highlight-added";

                elements.push(
                    <button
                        key={`diff-${diff.id}`}
                        onClick={() => setSelectedDiff(diff)}
                        className={cn(
                            highlightClass,
                            "cursor-pointer hover:opacity-80 transition-opacity",
                            "rounded px-0.5"
                        )}
                    >
                        {diff.correctedText}
                    </button>
                );
            }
            lastIndex = diff.endIndex;
        });

        // Add remaining text after last diff
        if (lastIndex < correctedText.length) {
            elements.push(
                <span key="text-end">
                    {correctedText.slice(lastIndex)}
                </span>
            );
        }

        return elements;
    }, [correctedText, diffs]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(correctedText);
            setCopied(true);
            onCopy?.();
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const renderConfetti = () => {
        if (score === undefined || score < 100) return null;
        return (
            <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="confetti-piece"
                        style={{
                            left: `${Math.random() * 100}vw`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${Math.random()}s`,
                            backgroundColor: ['#34d399', '#fbbf24', '#60a5fa', '#f87171'][Math.floor(Math.random() * 4)]
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {renderConfetti()}
            {/* Score Header */}
            {typeof score === 'number' && (
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 transition-colors duration-500"
                    style={{ backgroundColor: score >= 100 ? 'rgba(236, 253, 245, 0.8)' : 'white' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle
                                    className="text-slate-100"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                />
                                <circle
                                    className={cn(
                                        "transition-all duration-1000 ease-out",
                                        score >= 100 ? "text-emerald-500" :
                                            score >= 80 ? "text-emerald-400" :
                                                score >= 50 ? "text-yellow-400" : "text-red-400"
                                    )}
                                    strokeWidth="4"
                                    strokeDasharray={2 * Math.PI * 20}
                                    strokeDashoffset={2 * Math.PI * 20 * (1 - score / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={cn(
                                    "text-sm font-bold",
                                    score >= 100 ? "text-emerald-600" : "text-slate-700"
                                )}>
                                    {Math.round(score)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium mb-0.5">現在の契約書スコア</div>
                            <div className={cn(
                                "text-lg font-bold flex items-center gap-2 transition-all",
                                score >= 100 ? "text-emerald-600 scale-105" : "text-slate-800"
                            )}>
                                {score >= 100 ? (
                                    <>
                                        <span>Perfect Score!</span>
                                        <span className="animate-bounce">💯</span>
                                        <span className="text-sm font-normal text-emerald-600/80 ml-2">完璧です！</span>
                                    </>
                                ) : (
                                    "修正を適用して100点を目指そう"
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {onExportDocs && (
                            <Button variant="outline" size="sm" onClick={onExportDocs} className="gap-2">
                                <FileText className="w-4 h-4" />
                                PDF出力
                            </Button>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            className={cn(
                                "text-white gap-2 transition-all duration-300",
                                score >= 100 ? "bg-emerald-600 hover:bg-emerald-700 shadow-md transform hover:scale-105" : "bg-slate-900 hover:bg-slate-800"
                            )}
                            onClick={() => {
                                if (onCopy) {
                                    onCopy();
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                    navigator.clipboard.writeText(correctedText);
                                }
                            }}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "コピーしました" : "全文をコピー"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-lg text-slate-800 whitespace-pre-wrap">
                {renderHighlightedText()}
            </div>

            {/* Bottom Sheet */}
            <DiffBottomSheet
                diff={selectedDiff}
                onEdit={() => {
                    if (selectedDiff && onSkipDiff) {
                        onSkipDiff(selectedDiff);
                        setSelectedDiff(null);
                    }
                }}
                onApply={() => {
                    if (selectedDiff && onApplyDiff) {
                        onApplyDiff(selectedDiff);
                        setSelectedDiff(null);
                    }
                }}
                onClose={() => setSelectedDiff(null)}
            />
        </div>
    );
}
