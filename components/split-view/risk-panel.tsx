"use client";

import { useRef, useEffect } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertOctagon, Check, ArrowRight, ArrowLeft, Lightbulb, CheckSquare, Square } from "lucide-react";
import { VIOLATED_LAW_EXPLANATIONS, ViolatedLaw } from "@/lib/types/clause-tags";

interface RiskPanelProps {
    risks: EnhancedAnalysisResult["risks"];
    highlightedRiskIndex: number | null;
    selectedRiskIndices: number[];
    onRiskHover: (index: number | null) => void;
    onRiskSelect: (index: number) => void;
    onRiskToggle: (index: number) => void;
    onScrollToContract: (index: number) => void;
}

export function RiskPanel({
    risks,
    highlightedRiskIndex,
    selectedRiskIndices,
    onRiskHover,
    onRiskSelect,
    onRiskToggle,
    onScrollToContract
}: RiskPanelProps) {
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Scroll to highlighted card when highlightedRiskIndex changes
    useEffect(() => {
        if (highlightedRiskIndex !== null && highlightedRiskIndex !== -1) { // -1 check just in case
            const element = cardRefs.current.get(highlightedRiskIndex);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedRiskIndex]);

    // Get risk styling based on level
    const getRiskStyling = (riskLevel: string) => {
        switch (riskLevel) {
            case "critical":
                return {
                    border: "border-l-purple-600",
                    bg: "bg-purple-50/30",
                    badge: "bg-purple-100 text-purple-700 border-purple-200",
                    label: "重大リスク",
                    icon: <AlertOctagon className="w-4 h-4 text-purple-600" />,
                };
            case "high":
                return {
                    border: "border-l-red-500",
                    bg: "bg-red-50/30",
                    badge: "bg-red-100 text-red-700 border-red-200",
                    label: "HIGH RISK",
                    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                };
            case "medium":
                return {
                    border: "border-l-yellow-500",
                    bg: "bg-yellow-50/30",
                    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    label: "MED RISK",
                    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                };
            default:
                return {
                    border: "border-l-green-500",
                    bg: "bg-green-50/30",
                    badge: "bg-green-100 text-green-700 border-green-200",
                    label: "提案",
                    icon: <Check className="w-4 h-4 text-green-500" />,
                };
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">✨ AI診断レポート</span>
                    <Badge variant="outline" className="rounded-full text-[10px] px-2">
                        {risks.length}箇所を検出
                    </Badge>
                </div>
                {/* C-4: Color-independent design - add icons next to colors */}
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-purple-600" />
                        <span className="w-2 h-2 rounded-full bg-purple-600" />重大
                    </span>
                    <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="w-2 h-2 rounded-full bg-red-500" />HIGH
                    </span>
                    <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />MED
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-auto p-4 space-y-4 pb-24">
                {risks.map((risk, index) => {
                    const styling = getRiskStyling(risk.risk_level);
                    const isHighlighted = highlightedRiskIndex === index;
                    const isSelected = selectedRiskIndices.includes(index);
                    // 無意味な提案かどうかを判定
                    const isUselessSuggestion = risk.suggestion.revised_text
                        ? (risk.suggestion.revised_text.includes("専門家") && risk.suggestion.revised_text.length < 60)
                        : true;

                    const canAdopt = !!risk.suggestion.revised_text && !isUselessSuggestion;

                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                if (el) cardRefs.current.set(index, el);
                            }}
                            className={`
                                relative p-4 rounded-lg border shadow-sm transition-all duration-300
                                border-l-4 ${styling.border} 
                                ${isSelected ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-300" : styling.bg}
                                ${isHighlighted ? "ring-2 ring-slate-400 shadow-md" : (!isSelected && "border-slate-200 hover:shadow-md")}
                            `}
                            onMouseEnter={() => onRiskHover(index)}
                            onMouseLeave={() => onRiskHover(null)}
                            onClick={() => onRiskSelect(index)}
                        >
                            {/* Selection Checkbox (Only if adoptable) */}
                            {canAdopt && (
                                <div className="absolute top-4 right-4 z-10">
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
                                                採用
                                            </>
                                        ) : (
                                            <>
                                                <Square className="w-3.5 h-3.5" />
                                                修正案を採用
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Header Row */}
                            <div className="flex items-start justify-between mb-3 pr-24">
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        w-6 h-6 rounded-full flex items-center justify-center
                                        text-xs font-bold ${styling.badge} border
                                    `}>
                                        {index + 1}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${styling.badge}`}>
                                        {styling.label}
                                    </span>
                                </div>
                                {!canAdopt && styling.icon}
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-bold text-slate-800 mb-2">
                                {risk.section_title || "条項"}
                            </h4>

                            {/* Explanation */}
                            <div className="mb-3">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    検出されたリスク
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {risk.explanation}
                                </p>
                            </div>

                            {/* Suggestion Box */}
                            {risk.suggestion.revised_text && !isUselessSuggestion && (
                                <div
                                    className={`
                                        border rounded-lg p-3 mb-3 cursor-pointer transition-colors
                                        ${isSelected ? "bg-blue-100/50 border-blue-200" : "bg-teal-50 border-teal-100 hover:bg-teal-100/50"}
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRiskToggle(index);
                                    }}
                                >
                                    <div className={`flex items-center gap-1 text-[10px] mb-1 font-medium
                                        ${isSelected ? 'text-blue-700' : 'text-teal-700'}`}>
                                        <Lightbulb className="w-3 h-3" />
                                        改善の提案 {isSelected && <span className="ml-1 text-blue-600 font-bold">(採用中)</span>}
                                    </div>
                                    <p className={`text-xs leading-relaxed ${isSelected ? 'text-blue-900' : 'text-teal-800'}`}>
                                        {risk.suggestion.revised_text}
                                    </p>
                                </div>
                            )}

                            {/* Violated Laws */}
                            {risk.violated_laws && risk.violated_laws.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
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

                            {/* Link to Contract */}
                            <button
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors mt-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onScrollToContract(index);
                                }}
                            >
                                <ArrowLeft className="w-3 h-3" />
                                原本内の該当箇所と連結
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
