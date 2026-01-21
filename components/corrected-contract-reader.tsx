"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Copy, FileText, Check, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiffBottomSheet } from "./diff-bottom-sheet";

export type DiffType = "modified" | "added" | "deleted";

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
    onCopy?: () => void;
    onExportDocs?: () => void;
}

export function CorrectedContractReader({
    originalText,
    correctedText,
    diffs,
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
            } else {
                // Show highlighted text
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

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-foreground">AI修正版 契約書</h2>
                        <p className="text-xs text-muted-foreground">
                            {diffs.length}箇所を改善しました
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="hidden md:flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded highlight-modified" />
                        <span className="text-muted-foreground">修正</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded highlight-added" />
                        <span className="text-muted-foreground">追記</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
                        <span className="text-muted-foreground">削除</span>
                    </div>
                </div>
            </div>

            {/* Contract Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6 md:p-8">
                        <div className="prose prose-sm max-w-none leading-relaxed text-foreground whitespace-pre-wrap">
                            {renderHighlightedText()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-primary/10 bg-white px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground hidden sm:block">
                        ハイライト箇所をタップすると詳細を確認できます
                    </p>
                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            className="rounded-full border-primary/20 hover:bg-primary/5"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    コピー完了
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    クリップボードにコピー
                                </>
                            )}
                        </Button>
                        {onExportDocs && (
                            <Button
                                onClick={onExportDocs}
                                className="rounded-full bg-primary hover:bg-primary/90 text-white"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Google Docs連携
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Sheet */}
            <DiffBottomSheet
                diff={selectedDiff}
                onClose={() => setSelectedDiff(null)}
            />
        </div>
    );
}
