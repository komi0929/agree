"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertOctagon, Check, ChevronDown, ChevronUp, Lightbulb, CheckSquare, Square, Sparkles, Shield, ShieldCheck } from "lucide-react";
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
    useEffect(() => {
        if (highlightedRiskIndex !== null && highlightedRiskIndex !== -1) {
            // Auto-expand the highlighted card
            setExpandedCards(prev => {
                if (prev.has(highlightedRiskIndex)) return prev;
                const next = new Set(prev);
                next.add(highlightedRiskIndex);
                return next;
            });

            // Removed isUserScrolling check to allow rapid navigation

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

    // Get risk styling based on level - 色分けで視認性向上
    const getRiskStyling = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return {
                    border: "border-l-red-500",
                    bg: "bg-red-50",
                    badge: "bg-red-100 text-red-700 border-red-200",
                    label: "ご確認ください",
                    labelShort: "重要",
                    icon: <AlertOctagon className="w-4 h-4 text-red-600" />,
                    highlightColor: "bg-red-100",
                    dotColor: "bg-red-500",
                };
            case "high":
                return {
                    border: "border-l-orange-400",
                    bg: "bg-orange-50/50",
                    badge: "bg-orange-100 text-orange-700 border-orange-200",
                    label: "確認をおすすめします",
                    labelShort: "確認推奨",
                    icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
                    highlightColor: "bg-orange-100",
                    dotColor: "bg-orange-400",
                };
            case "medium":
                return {
                    border: "border-l-yellow-400",
                    bg: "bg-yellow-50/30",
                    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    label: "ご参考まで",
                    labelShort: "参考",
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
                    highlightColor: "bg-yellow-100",
                    dotColor: "bg-yellow-400",
                };
            default:
                return {
                    border: "border-l-blue-300",
                    bg: "bg-blue-50/30",
                    badge: "bg-blue-100 text-blue-600 border-blue-200",
                    label: "あると安心です",
                    labelShort: "推奨",
                    icon: <Check className="w-4 h-4 text-blue-500" />,
                    highlightColor: "bg-blue-100",
                    dotColor: "bg-blue-400",
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
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">確認事項</span>
                    <Badge variant="outline" className="rounded-full text-[10px] px-2 text-muted-foreground border-primary/20">
                        {risks.filter(r => r.risk_level !== "low").length}件
                    </Badge>
                </div>
                {/* Legend - 色分けの凡例 */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />重要
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />確認推奨
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />参考
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />推奨
                    </span>
                </div>
            </div>

            {/* Cards - pb-40で固定フッターとの重なりを防止 */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto p-4 space-y-4 pb-40"
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
                                ${isSelected ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-white"}
                                ${isHighlighted ? "ring-2 ring-primary/30 shadow-md scale-[1.01]" : (!isSelected && "border-primary/10 hover:shadow-md hover:border-primary/20")}
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
                                        {/* Risk Level Badge + Source Badge */}
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styling.badge}`}>
                                                {styling.label}
                                            </span>
                                            {/* Source Badge - 検出ソースの信頼度表示 */}
                                            {risk.source === "rule" && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    確実
                                                </span>
                                            )}
                                            {risk.source === "llm" && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    AI分析
                                                </span>
                                            )}
                                            {risk.source === "both" && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    確認済み
                                                </span>
                                            )}
                                            <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="text-sm font-bold text-foreground mb-1">
                                            {risk.section_title || "条項"}
                                        </h4>

                                        {/* Quick Summary - First line of explanation */}
                                        <p className="text-xs text-muted-foreground line-clamp-2">
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
                                                        ? "bg-primary text-white shadow-md hover:bg-primary/90"
                                                        : "bg-white text-muted-foreground border border-primary/20 hover:border-primary/40 hover:text-primary"
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
                                        <button className="p-1 text-muted-foreground hover:text-primary">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content - Nani-style Rationale */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-4 border-t border-primary/5 pt-4 animate-in slide-in-from-top-2 duration-200">

                                    {/* Section: 具体的にどうなる？ */}
                                    {risk.practical_impact && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                具体的にどうなる？
                                            </div>
                                            <div className="bg-primary/5 rounded-lg p-3 text-xs text-foreground leading-relaxed border border-primary/10">
                                                {risk.practical_impact}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section: おすすめの対処法 */}
                                    {canAdopt && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                <Lightbulb className="w-4 h-4 text-primary" />
                                                おすすめの対処法
                                            </div>
                                            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                                <p className="text-xs text-foreground">{getWhatToDo(risk)}</p>
                                                <div className="bg-white rounded-lg p-3 border border-primary/10">
                                                    <p className="text-xs font-medium text-foreground mb-1">修正案</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
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
                                                            ? "bg-primary text-white hover:bg-primary/90 hover:text-[#FFD700]"
                                                            : "bg-white border border-primary/20 text-muted-foreground hover:bg-primary/5 hover:text-primary"
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
                                        <div className="flex flex-wrap gap-1 pt-2 border-t border-primary/5">
                                            <span className="text-[10px] text-muted-foreground mr-1">関連法令:</span>
                                            {risk.violated_laws.map((law, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="text-[9px] bg-muted text-muted-foreground rounded-full"
                                                >
                                                    {VIOLATED_LAW_EXPLANATIONS[law as ViolatedLaw]?.split("（")[0] || law}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Contract Link - only show if there is text to highlight */}
                                    {risk.original_text && risk.original_text.length > 0 && (
                                        <button
                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onScrollToContract(index);
                                            }}
                                        >
                                            該当箇所を見る
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
