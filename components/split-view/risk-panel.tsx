"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertOctagon, Check, ChevronDown, ChevronUp, Lightbulb, CheckSquare, Square, FileText, HelpCircle, Sparkles } from "lucide-react";
import { VIOLATED_LAW_EXPLANATIONS, ViolatedLaw } from "@/lib/types/clause-tags";
import { RiskLevelFilter } from "./summary-header";

interface RiskPanelProps {
    risks: EnhancedAnalysisResult["risks"];
    highlightedRiskIndex: number | null;
    selectedRiskIndices: number[];
    activeFilter?: RiskLevelFilter;
    onRiskHover: (index: number | null) => void;
    onRiskSelect: (index: number) => void;
    onRiskToggle: (index: number) => void;
    onScrollToContract: (index: number) => void;
}

export function RiskPanel({
    risks,
    highlightedRiskIndex,
    selectedRiskIndices,
    activeFilter,
    onRiskHover,
    onRiskSelect,
    onRiskToggle,
    onScrollToContract
}: RiskPanelProps) {
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    // Track if user is manually scrolling to prevent auto-scroll interference
    const isUserScrolling = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastProgrammaticScrollIndex = useRef<number | null>(null);

    // Handle user scroll detection
    const handleScrollStart = useCallback(() => {
        isUserScrolling.current = true;
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        // Reset user scrolling flag after 1 second of no scrolling
        scrollTimeoutRef.current = setTimeout(() => {
            isUserScrolling.current = false;
        }, 1000);
    }, []);

    // Scroll to highlighted card when highlightedRiskIndex changes
    // Only scroll programmatically when it's triggered by clicking on contract highlights
    useEffect(() => {
        if (highlightedRiskIndex !== null && highlightedRiskIndex !== -1) {
            // Don't scroll if user is manually scrolling or if we just scrolled to this index
            if (isUserScrolling.current) {
                return;
            }
            // Only scroll if this is a new index (not from hover)
            if (lastProgrammaticScrollIndex.current === highlightedRiskIndex) {
                return;
            }
            const element = cardRefs.current.get(highlightedRiskIndex);
            if (element) {
                lastProgrammaticScrollIndex.current = highlightedRiskIndex;
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedRiskIndex]);

    const toggleExpanded = (index: number) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Get risk styling based on level
    const getRiskStyling = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return {
                    border: "border-l-purple-600",
                    bg: "bg-purple-50/30",
                    badge: "bg-purple-100 text-purple-700 border-purple-200",
                    label: "🔥 ここは特に大事",
                    labelShort: "特に大事",
                    icon: <AlertOctagon className="w-4 h-4 text-purple-600" />,
                };
            case "high":
                return {
                    border: "border-l-red-500",
                    bg: "bg-red-50/30",
                    badge: "bg-red-100 text-red-700 border-red-200",
                    label: "⚠️ 確認推奨",
                    labelShort: "確認推奨",
                    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                };
            case "medium":
                return {
                    border: "border-l-yellow-500",
                    bg: "bg-yellow-50/30",
                    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    label: "💡 ご参考",
                    labelShort: "ご参考",
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                };
            default:
                return {
                    border: "border-l-green-500",
                    bg: "bg-green-50/30",
                    badge: "bg-green-100 text-green-700 border-green-200",
                    label: "📝 あると良い",
                    labelShort: "あると良い",
                    icon: <Check className="w-4 h-4 text-green-500" />,
                };
        }
    };

    // Parse explanation to extract "why dangerous" context
    const parseWhyDangerous = (explanation: string): string => {
        // The explanation already contains the "why" - make it more conversational
        return explanation;
    };

    // Generate "what to do" recommendation based on suggestion
    const getWhatToDo = (risk: EnhancedAnalysisResult["risks"][0]): string => {
        if (risk.suggestion.revised_text) {
            return `この条項を以下のように修正することをおすすめします。`;
        }
        return "専門家に相談して、この条項について確認することをおすすめします。";
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">要確認</span>
                    <Badge variant="outline" className="rounded-full text-[10px] px-2">
                        {risks.filter(r => r.risk_level !== "low").length}件
                    </Badge>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />特に大事
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />確認推奨
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />ご参考
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto p-4 space-y-4 pb-24"
                onScroll={handleScrollStart}
            >
                {risks.map((risk, index) => {
                    // Filter: skip cards that don't match activeFilter
                    if (activeFilter && risk.risk_level !== activeFilter) {
                        return null;
                    }

                    const styling = getRiskStyling(risk.risk_level);
                    const isHighlighted = highlightedRiskIndex === index;
                    const isSelected = selectedRiskIndices.includes(index);
                    const isExpanded = expandedCards.has(index);

                    // 問題なし（low）の場合は採択ボタンを表示しない
                    const isLowRisk = risk.risk_level === "low";

                    // 無意味な提案かどうかを判定（問題なしは常に採択不可）
                    const isUselessSuggestion = isLowRisk || (risk.suggestion.revised_text
                        ? (risk.suggestion.revised_text.includes("専門家") && risk.suggestion.revised_text.length < 60)
                        : true);

                    const canAdopt = !!risk.suggestion.revised_text && !isUselessSuggestion;

                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                if (el) cardRefs.current.set(index, el);
                            }}
                            className={`
                                relative rounded-xl border shadow-sm transition-all duration-300
                                border-l-4 ${styling.border} 
                                ${isSelected ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-300" : styling.bg}
                                ${isHighlighted ? "ring-2 ring-slate-400 shadow-md" : (!isSelected && "border-slate-200 hover:shadow-md")}
                            `}
                            onMouseEnter={() => onRiskHover(index)}
                            onMouseLeave={() => onRiskHover(null)}
                        >
                            {/* Compact Header - Always Visible */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => toggleExpanded(index)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Risk Level Badge */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styling.badge}`}>
                                                {styling.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400">#{index + 1}</span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                                            {risk.section_title || "条項"}
                                        </h4>

                                        {/* Quick Summary - First line of explanation */}
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {risk.explanation.split("。")[0]}。
                                        </p>
                                    </div>

                                    {/* Expand/Collapse */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {canAdopt && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRiskToggle(index);
                                                }}
                                                className={`
                                                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                                    ${isSelected
                                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                                        : "bg-white text-slate-500 border border-slate-200 hover:border-blue-400 hover:text-blue-600"
                                                    }
                                                `}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <CheckSquare className="w-3.5 h-3.5" />
                                                        選択中 ✓
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className="w-3.5 h-3.5" />
                                                        この修正を選択
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button className="p-1 text-slate-400 hover:text-slate-600">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content - Nani-style Rationale */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4 animate-in slide-in-from-top-2 duration-200">

                                    {/* Section: 具体的にどうなる？ */}
                                    {risk.practical_impact && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                                                <AlertTriangle className="w-4 h-4" />
                                                具体的にどうなる？
                                            </div>
                                            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-900 leading-relaxed border border-rose-100">
                                                {risk.practical_impact}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section: おすすめの対処法 */}
                                    {canAdopt && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                                                <Lightbulb className="w-4 h-4" />
                                                おすすめの対処法
                                            </div>
                                            <div className="bg-teal-50 rounded-lg p-3 space-y-2">
                                                <p className="text-xs text-teal-800">{getWhatToDo(risk)}</p>
                                                <div className="bg-white rounded-lg p-3 border border-teal-100">
                                                    <p className="text-xs font-medium text-teal-900 mb-1">💡 修正案</p>
                                                    <p className="text-xs text-teal-800 leading-relaxed">
                                                        {risk.suggestion.revised_text}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRiskToggle(index);
                                                    }}
                                                    className={`
                                                        w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all
                                                        ${isSelected
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-teal-600 text-white hover:bg-teal-700"
                                                        }
                                                    `}
                                                >
                                                    {isSelected ? (
                                                        <>
                                                            <CheckSquare className="w-4 h-4" />
                                                            この修正案を採用中
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4" />
                                                            この修正案を採用する
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}



                                    {/* Violated Laws */}
                                    {risk.violated_laws && risk.violated_laws.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                                            <span className="text-[10px] text-slate-400 mr-1">関連法令:</span>
                                            {risk.violated_laws.map((law, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="text-[9px] bg-slate-100 text-slate-600 rounded-full"
                                                >
                                                    {VIOLATED_LAW_EXPLANATIONS[law as ViolatedLaw]?.split("（")[0] || law}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Contract Link */}
                                    <button
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onScrollToContract(index);
                                        }}
                                    >
                                        📍 契約書で確認
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
