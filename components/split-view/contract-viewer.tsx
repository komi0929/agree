"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { FileText } from "lucide-react";

interface ContractViewerProps {
    text: string;
    risks: EnhancedAnalysisResult["risks"];
    highlightedRiskIndex: number | null;
    onHighlightClick?: (index: number) => void;
}

interface Match {
    start: number;
    end: number;
    riskIndex: number;
}

export function ContractViewer({ text, risks, highlightedRiskIndex, onHighlightClick }: ContractViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLSpanElement>(null);

    // Find all matches for all risks
    const matches = useMemo(() => {
        const foundMatches: Match[] = [];
        const normalizeText = (str: string) => str.replace(/\s+/g, '');
        const normalizedContractText = normalizeText(text);

        risks.forEach((risk, index) => {
            if (!risk?.original_text || risk.original_text.length < 5) return;
            // Skip low risk (missing clauses) as they don't exist in text
            if (risk.risk_level === "low") return;

            // Strategy 1: Direct match
            let pos = text.indexOf(risk.original_text);
            if (pos !== -1) {
                // Limit highlight length to avoid "meaningless" huge highlights
                // If it's too long, it's often the whole article which isn't helpful
                const maxLength = Math.min(risk.original_text.length, 180);
                foundMatches.push({ start: pos, end: pos + maxLength, riskIndex: index });
                return;
            }

            // Strategy 2: Normalized match (handles whitespace differences)
            const normalizedOriginal = normalizeText(risk.original_text);
            if (normalizedOriginal.length < 5) return;

            const normalizedPos = normalizedContractText.indexOf(normalizedOriginal);
            if (normalizedPos !== -1) {
                let originalPos = 0;
                let normalizedIdx = 0;

                // Map back normalized position to original text position
                while (normalizedIdx < normalizedPos && originalPos < text.length) {
                    const char = text[originalPos];
                    if (/\s/.test(char)) {
                        originalPos++;
                        continue;
                    }
                    if (normalizedContractText[normalizedIdx] === char) {
                        normalizedIdx++;
                    }
                    originalPos++;
                }

                const maxLength = Math.min(risk.original_text.length, 180);
                foundMatches.push({
                    start: originalPos,
                    end: Math.min(originalPos + maxLength, text.length),
                    riskIndex: index
                });
            }
        });

        // Sort matches by start position and remove overlaps
        return foundMatches
            .sort((a, b) => a.start - b.start)
            .reduce((acc, current) => {
                if (acc.length === 0) return [current];
                const last = acc[acc.length - 1];
                // If they overlap, keep the one that matches the currently selected risk, 
                // or just keep the first one
                if (current.start >= last.end) {
                    acc.push(current);
                } else if (current.riskIndex === highlightedRiskIndex) {
                    // Replace previous with this one if this is the active selection
                    acc[acc.length - 1] = current;
                }
                return acc;
            }, [] as Match[]);
    }, [text, risks, highlightedRiskIndex]);

    // Scroll to highlighted text when selection changes
    useEffect(() => {
        if (highlightedRiskIndex !== null && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [highlightedRiskIndex]);

    // Color styling for highlights
    const getHighlightStyles = (riskIndex: number) => {
        const risk = risks[riskIndex];
        const isActive = highlightedRiskIndex === riskIndex;

        const base = "inline cursor-pointer transition-all duration-200 rounded px-1 py-0.5 border-b-2 font-medium";

        if (isActive) {
            const activeBase = `${base} font-bold ring-4 ring-offset-1 shadow-lg z-10 scale-[1.03] animate-in fade-in zoom-in-95 duration-300`;
            switch (risk?.risk_level) {
                case "critical": return `${activeBase} bg-purple-200 border-purple-500 text-purple-900 ring-purple-300`;
                case "high": return `${activeBase} bg-red-200 border-red-500 text-red-900 ring-red-300`;
                case "medium": return `${activeBase} bg-yellow-200 border-yellow-500 text-yellow-900 ring-yellow-300`;
                default: return `${activeBase} bg-green-200 border-green-500 text-green-900 ring-green-300`;
            }
        } else {
            const inactiveBase = `${base} opacity-70 hover:opacity-100 hover:scale-[1.01]`;
            switch (risk?.risk_level) {
                case "critical": return `${inactiveBase} bg-purple-100/50 border-purple-200 text-purple-800`;
                case "high": return `${inactiveBase} bg-red-100/50 border-red-200 text-red-800`;
                case "medium": return `${inactiveBase} bg-yellow-100/50 border-yellow-200 text-yellow-800`;
                default: return `${inactiveBase} bg-green-100/50 border-green-200 text-green-800`;
            }
        }
    };

    const renderContent = () => {
        if (matches.length === 0) {
            return text.split(/(\n)/).map((segment, i) => (
                <span key={i} className="whitespace-pre-wrap text-slate-600">
                    {segment}
                </span>
            ));
        }

        const elements: React.ReactNode[] = [];
        let lastIdx = 0;

        matches.forEach((match, i) => {
            // Text before match
            if (match.start > lastIdx) {
                const beforeText = text.slice(lastIdx, match.start);
                elements.push(
                    <span key={`text-before-${i}`} className="whitespace-pre-wrap text-slate-600">
                        {beforeText}
                    </span>
                );
            }

            // The highlight
            const isActive = highlightedRiskIndex === match.riskIndex;
            elements.push(
                <span
                    key={`match-${i}`}
                    ref={isActive ? highlightRef : undefined}
                    onClick={() => onHighlightClick?.(match.riskIndex)}
                    className={getHighlightStyles(match.riskIndex)}
                >
                    {text.slice(match.start, match.end)}
                </span>
            );

            lastIdx = match.end;
        });

        // Remaining text
        if (lastIdx < text.length) {
            elements.push(
                <span key="text-remaining" className="whitespace-pre-wrap text-slate-600">
                    {text.slice(lastIdx)}
                </span>
            );
        }

        return elements;
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">契約書</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        ハイライトをクリックしてリスクを確認
                    </span>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-auto bg-white">
                <div
                    ref={containerRef}
                    className="max-w-3xl mx-auto p-12 lg:p-16 min-h-full shadow-inner bg-white font-serif leading-relaxed"
                    style={{ fontSize: "15px" }}
                >
                    <div className="space-y-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}
