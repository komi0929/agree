"use client";

import { useEffect, useRef, useCallback } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { FileText } from "lucide-react";

interface ContractViewerProps {
    text: string;
    risks: EnhancedAnalysisResult["risks"];
    highlightedRiskIndex: number | null;
    onHighlightClick?: (index: number) => void;
}

export function ContractViewer({ text, risks, highlightedRiskIndex, onHighlightClick }: ContractViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const highlightRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Create highlighted text with matching regions
    const createHighlightedContent = useCallback(() => {
        // Build a list of text regions with their risk associations
        const regions: Array<{
            text: string;
            riskIndices: number[];
            isHighlight: boolean;
        }> = [];

        // Find all risk matches in the text
        const matches: Array<{ start: number; end: number; riskIndex: number }> = [];

        risks.forEach((risk, index) => {
            if (risk.original_text && risk.original_text.length > 10) {
                // Try to find exact match
                const pos = text.indexOf(risk.original_text);
                if (pos !== -1) {
                    matches.push({
                        start: pos,
                        end: pos + risk.original_text.length,
                        riskIndex: index,
                    });
                } else {
                    // Try partial match (first 50 chars)
                    const partial = risk.original_text.substring(0, 50);
                    const partialPos = text.indexOf(partial);
                    if (partialPos !== -1) {
                        matches.push({
                            start: partialPos,
                            end: partialPos + risk.original_text.length,
                            riskIndex: index,
                        });
                    }
                }
            }
        });

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start);

        // Build regions
        let lastEnd = 0;
        matches.forEach((match) => {
            // Add non-highlighted region before this match
            if (match.start > lastEnd) {
                regions.push({
                    text: text.slice(lastEnd, match.start),
                    riskIndices: [],
                    isHighlight: false,
                });
            }

            // Add highlighted region
            regions.push({
                text: text.slice(match.start, match.end),
                riskIndices: [match.riskIndex],
                isHighlight: true,
            });

            lastEnd = match.end;
        });

        // Add any remaining text
        if (lastEnd < text.length) {
            regions.push({
                text: text.slice(lastEnd),
                riskIndices: [],
                isHighlight: false,
            });
        }

        return regions;
    }, [text, risks]);

    const regions = createHighlightedContent();

    // Scroll to highlighted risk
    useEffect(() => {
        if (highlightedRiskIndex !== null) {
            const element = highlightRefs.current.get(highlightedRiskIndex);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedRiskIndex]);

    // Get risk level color
    const getRiskColor = (riskIndex: number) => {
        const risk = risks[riskIndex];
        if (!risk) return { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-600" };

        switch (risk.risk_level) {
            case "critical":
                return { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-700" };
            case "high":
                return { bg: "bg-red-50", border: "border-red-400", text: "text-red-700" };
            case "medium":
                return { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700" };
            default:
                return { bg: "bg-green-50", border: "border-green-400", text: "text-green-700" };
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">契約書原本（プレビュー）</span>
                </div>
                <span className="text-xs text-slate-400">
                    ハイライト部分にリスクが潜んでいます
                </span>
            </div>

            {/* Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto p-8 bg-white"
            >
                <div className="max-w-none prose prose-sm prose-slate">
                    {regions.map((region, idx) => {
                        if (!region.isHighlight) {
                            // Normal text - preserve line breaks
                            return (
                                <span key={idx} className="whitespace-pre-wrap">
                                    {region.text}
                                </span>
                            );
                        }

                        // Highlighted region
                        const riskIndex = region.riskIndices[0];
                        const colors = getRiskColor(riskIndex);
                        const isActive = highlightedRiskIndex === riskIndex;

                        return (
                            <span
                                key={idx}
                                ref={(el) => {
                                    if (el) highlightRefs.current.set(riskIndex, el as any);
                                }}
                                className={`
                                    relative inline cursor-pointer transition-all duration-300
                                    ${colors.bg} ${isActive ? `ring-2 ${colors.border} ring-offset-1` : ""}
                                    border-l-4 ${colors.border} pl-1 pr-1 py-0.5
                                    hover:ring-2 hover:ring-offset-1
                                `}
                                onClick={() => onHighlightClick?.(riskIndex)}
                            >
                                {/* Risk number badge */}
                                <span className={`
                                    absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center
                                    text-[10px] font-bold ${colors.bg} ${colors.text} ${colors.border} border
                                `}>
                                    {riskIndex + 1}
                                </span>
                                {region.text}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
