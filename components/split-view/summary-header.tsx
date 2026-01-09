"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { AlertTriangle, AlertOctagon, FileText, X } from "lucide-react";

export type RiskLevelFilter = "critical" | "high" | "medium" | "low" | null;

interface SummaryHeaderProps {
    data: EnhancedAnalysisResult;
    contractType?: string;
    activeFilter?: RiskLevelFilter;
    onFilterChange?: (filter: RiskLevelFilter) => void;
}

export function SummaryHeader({ data, contractType, activeFilter, onFilterChange }: SummaryHeaderProps) {
    // Count risks by level
    const criticalCount = data.risks.filter(r => r.risk_level === "critical").length;
    const highCount = data.risks.filter(r => r.risk_level === "high").length;
    const mediumCount = data.risks.filter(r => r.risk_level === "medium").length;
    const lowCount = data.risks.filter(r => r.risk_level === "low").length;

    // Calculate simple score (100 - weighted deductions)
    // Adjusted weights to avoid 0 score too easily (2025-01-09)
    const score = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5) - (lowCount * 1));

    // Professional message based on score
    const getScoreMessage = () => {
        if (score >= 80) return { text: "とても良い契約書です" };
        if (score >= 60) return { text: "いくつか確認したい点があります" };
        if (score >= 40) return { text: "確認が必要な箇所があります" };
        return { text: "慎重にご確認ください" };
    };

    const scoreMessage = getScoreMessage();

    const handleFilterClick = (level: RiskLevelFilter) => {
        if (!onFilterChange) return;
        // Toggle: if already active, clear filter
        if (activeFilter === level) {
            onFilterChange(null);
        } else {
            onFilterChange(level);
        }
    };

    // Helper to get pill classes based on filter state
    const getPillClasses = (level: RiskLevelFilter, baseClasses: { active: string; inactive: string; default: string }) => {
        if (activeFilter === level) {
            return baseClasses.active;
        } else if (activeFilter !== null) {
            return baseClasses.inactive;
        }
        return baseClasses.default;
    };

    return (
        <div className="bg-playful-gradient border-b border-slate-200 px-6 py-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                {/* Score Circle with Animation */}
                <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 flex items-center justify-center animate-bounce-in">
                        {/* Outer glow */}
                        <div className={`absolute inset-0 rounded-full ${score >= 70 ? "bg-emerald-100" : score >= 40 ? "bg-amber-100" : "bg-red-100"} blur-md opacity-50`} />
                        <svg className="w-20 h-20 -rotate-90 relative z-10" viewBox="0 0 64 64">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#e2e8f0"
                                strokeWidth="4"
                                fill="white"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(score / 100) * 176} 176`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <span className="text-2xl font-bold text-slate-800">{score}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">SCORE</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-slate-800">
                                確認が完了しました
                            </h2>
                        </div>
                        <p className="text-sm text-slate-600">
                            {scoreMessage.text}
                            <span className="ml-2 text-slate-400">— {data.risks.filter(r => r.risk_level !== "low").length}件の確認事項</span>
                        </p>
                        {/* Contract Type Badge */}
                        {contractType && contractType !== "不明" && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 text-slate-600 text-xs rounded-full border border-slate-200 shadow-sm">
                                    <FileText className="w-3 h-3" />
                                    {contractType}として確認
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Level Filter Pills - Clickable */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Clear filter indicator */}
                    {activeFilter && (
                        <button
                            onClick={() => onFilterChange?.(null)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm transition-all"
                        >
                            <X className="w-3 h-3" />
                            クリア
                        </button>
                    )}
                    {criticalCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("critical")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-slate-100 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("critical", {
                                active: "border-slate-500 ring-2 ring-slate-300 scale-105 bg-slate-200",
                                inactive: "border-slate-200 opacity-50",
                                default: "border-slate-200 hover:scale-105 hover:bg-slate-200"
                            })}`}
                        >
                            <AlertOctagon className="w-3.5 h-3.5 text-slate-700" />
                            <span className="text-xs font-medium text-slate-700">ご確認ください {criticalCount}</span>
                        </button>
                    )}
                    {highCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("high")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-slate-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("high", {
                                active: "border-slate-500 ring-2 ring-slate-300 scale-105 bg-slate-200",
                                inactive: "border-slate-200 opacity-50",
                                default: "border-slate-200 hover:scale-105 hover:bg-slate-100"
                            })}`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-xs font-medium text-slate-600">確認をおすすめ {highCount}</span>
                        </button>
                    )}
                    {mediumCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("medium")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-slate-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("medium", {
                                active: "border-slate-500 ring-2 ring-slate-300 scale-105 bg-slate-200",
                                inactive: "border-slate-200 opacity-50",
                                default: "border-slate-200 hover:scale-105 hover:bg-slate-100"
                            })}`}
                        >
                            <span className="text-xs font-medium text-slate-600">ご参考まで {mediumCount}</span>
                        </button>
                    )}
                    {lowCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("low")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-slate-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("low", {
                                active: "border-slate-500 ring-2 ring-slate-300 scale-105 bg-slate-200",
                                inactive: "border-slate-200 opacity-50",
                                default: "border-slate-200 hover:scale-105 hover:bg-slate-100"
                            })}`}
                        >
                            <span className="text-xs font-medium text-slate-600">あると安心 {lowCount}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
