"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Info, ArrowRight, Copy, AlertOctagon } from "lucide-react";
import { useState } from "react";
import { VIOLATED_LAW_EXPLANATIONS, ViolatedLaw } from "@/lib/types/clause-tags";

interface RiskPanelProps {
    risks: EnhancedAnalysisResult["risks"];
    onRiskHover: (index: number | null) => void;
    onRiskSelect: (index: number) => void;
}

export function RiskPanel({ risks, onRiskHover, onRiskSelect }: RiskPanelProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">解析レポート</h3>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {risks.length} 件の指摘
                </Badge>
            </div>

            <div className="space-y-4">
                {risks.map((risk, index) => {
                    const isSelected = selectedId === index;

                    // Categorize color based on risk_level (now includes critical)
                    let colorClass = "border-l-4 border-l-slate-300";
                    let icon = <Info className="w-4 h-4 text-slate-400" />;
                    let bgClass = "bg-white";
                    let levelLabel = "提案";

                    if (risk.risk_level === "critical") {
                        colorClass = "border-l-4 border-l-purple-600";
                        icon = <AlertOctagon className="w-4 h-4 text-purple-600" />;
                        bgClass = "bg-purple-50/20";
                        levelLabel = "重大リスク";
                    } else if (risk.risk_level === "high") {
                        colorClass = "border-l-4 border-l-red-500";
                        icon = <AlertTriangle className="w-4 h-4 text-red-500" />;
                        bgClass = "bg-red-50/10";
                        levelLabel = "修正必須";
                    } else if (risk.risk_level === "medium") {
                        colorClass = "border-l-4 border-l-yellow-400";
                        icon = <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                        bgClass = "bg-yellow-50/10";
                        levelLabel = "要検討";
                    } else {
                        colorClass = "border-l-4 border-l-green-400";
                        icon = <Check className="w-4 h-4 text-green-500" />;
                        bgClass = "bg-green-50/10";
                        levelLabel = "提案";
                    }

                    return (
                        <div
                            key={index}
                            className={`
                                group relative p-5 rounded-lg border border-slate-100 shadow-sm transition-all duration-300
                                ${colorClass} ${bgClass}
                                ${isSelected ? "ring-2 ring-slate-900 shadow-md transform scale-[1.02]" : "hover:shadow-md hover:border-slate-300"}
                            `}
                            onMouseEnter={() => onRiskHover(index)}
                            onMouseLeave={() => onRiskHover(null)}
                            onClick={() => {
                                setSelectedId(index);
                                onRiskSelect(index);
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {icon}
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {levelLabel}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-300">#{index + 1}</span>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 mb-2">
                                {risk.section_title || "条項"}
                            </h4>

                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                {risk.explanation}
                            </p>

                            {/* Violated Laws */}
                            {risk.violated_laws && risk.violated_laws.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {risk.violated_laws.map((law, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-[10px] bg-slate-100 text-slate-600 rounded-full"
                                        >
                                            {VIOLATED_LAW_EXPLANATIONS[law as ViolatedLaw]?.split("（")[0] || law}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Legal Basis */}
                            {risk.suggestion.legal_basis && (
                                <div className="text-xs text-slate-500 italic mb-3 p-2 bg-slate-50 rounded border-l-2 border-slate-300">
                                    💡 {risk.suggestion.legal_basis}
                                </div>
                            )}

                            <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 font-mono text-xs mb-4 border border-slate-100">
                                <div className="text-[10px] text-slate-400 mb-1">修正案:</div>
                                {risk.suggestion.revised_text}
                            </div>

                            {/* Actions Area - revealed on hover or select */}
                            <div className={`
                                flex items-center gap-2 pt-2 border-t border-slate-100 mt-2
                                ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity
                            `}>
                                <Button size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-700 h-9 text-xs rounded-full">
                                    修正を採用してメッセージを作成
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
