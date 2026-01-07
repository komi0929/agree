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

        // Normalize function to handle whitespace differences
        const normalizeText = (str: string) => str.replace(/\s+/g, ' ').trim();
        const normalizedContractText = normalizeText(text);

        risks.forEach((risk, index) => {
            if (!risk.original_text || risk.original_text.length < 5) return;

            const normalizedOriginal = normalizeText(risk.original_text);

            // Strategy 1: Try direct match in original text
            let pos = text.indexOf(risk.original_text);
            if (pos !== -1) {
                matches.push({
                    start: pos,
                    end: pos + risk.original_text.length,
                    riskIndex: index,
                });
                return;
            }

            // Strategy 2: Try normalized match (handles whitespace differences)
            const normalizedPos = normalizedContractText.indexOf(normalizedOriginal);
            if (normalizedPos !== -1) {
                // Map back to original text position
                let originalPos = 0;
                let normalizedIdx = 0;
                while (normalizedIdx < normalizedPos && originalPos < text.length) {
                    if (!/\s/.test(text[originalPos]) || normalizedContractText[normalizedIdx] === text[originalPos]) {
                        normalizedIdx++;
                    }
                    originalPos++;
                }
                matches.push({
                    start: originalPos,
                    end: Math.min(originalPos + risk.original_text.length, text.length),
                    riskIndex: index,
                });
                return;
            }

            // No match found - don't highlight to avoid incorrect positions
            // (Previously had Strategy 3 and 4 which caused wrong highlights)
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
                    <span className="text-sm font-medium text-slate-700">契約書</span>
                </div>
                <span className="text-xs text-slate-400">
                    色付き = 要確認
                </span>
            </div>

            {/* Content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto p-8 bg-white"
            >
                <div className="max-w-none prose prose-sm prose-slate leading-loose">
                    {regions.map((region, idx) => {
                        // 読みやすさのために句点の後に改行を入れる処理（ハイライトされていない部分のみ）
                        // ただし、元々改行がある場合はそのままにする
                        const displayContent = !region.isHighlight
                            ? region.text.split(/(?<=。)/).map((segment, i, arr) => (
                                <span key={i}>
                                    {segment}
                                    {i < arr.length - 1 && !segment.endsWith('\n') && <br className="mb-2 block content-['']" />}
                                </span>
                            ))
                            : region.text;

                        if (!region.isHighlight) {
                            return (
                                <span key={idx} className="whitespace-pre-wrap text-slate-600">
                                    {displayContent}
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
                                    relative inline cursor-pointer transition-all duration-300 rounded-sm
                                    ${colors.bg} ${isActive ? `ring-4 ${colors.border} ring-offset-2 z-10 font-bold shadow-sm` : "hover:brightness-95"}
                                    border-b-2 ${colors.border} px-1 py-0.5 mx-0.5
                                `}
                                onClick={() => onHighlightClick?.(riskIndex)}
                            >
                                {/* Risk number badge */}
                                <span className={`
                                    absolute -left-3 -top-3 w-5 h-5 rounded-full flex items-center justify-center
                                    text-[10px] font-bold ${colors.bg} ${colors.text} ${colors.border} border shadow-sm
                                    transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100'}
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
