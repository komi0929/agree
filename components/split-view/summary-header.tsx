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
                {/* Summary without score - 確認事項のサマリー */}
                <div className="flex items-center gap-5">
                    {/* Status indicator */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full ${criticalCount > 0 ? "bg-red-100" : highCount > 0 ? "bg-orange-100" : "bg-emerald-100"} blur-md opacity-50`} />
                        <div className={`relative z-10 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 ${criticalCount > 0 ? "border-red-400 bg-red-50" : highCount > 0 ? "border-orange-400 bg-orange-50" : "border-emerald-400 bg-emerald-50"}`}>
                            <span className="text-xl font-bold text-slate-800">{data.risks.filter(r => r.risk_level !== "low").length}</span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-wider">件</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-slate-800">
                                {criticalCount > 0 ? "確認が必要な項目があります" : highCount > 0 ? "いくつか確認したい点があります" : "おおむね問題ありません"}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-600">
                            {criticalCount > 0 && <span className="text-red-600 font-medium mr-2">重要 {criticalCount}件</span>}
                            {highCount > 0 && <span className="text-orange-600 font-medium mr-2">確認推奨 {highCount}件</span>}
                            {mediumCount > 0 && <span className="text-yellow-600 font-medium mr-2">参考 {mediumCount}件</span>}
                            {lowCount > 0 && <span className="text-blue-600 font-medium">推奨 {lowCount}件</span>}
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
                            className={`flex items-center gap-1.5 px-3 py-2 bg-red-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("critical", {
                                active: "border-red-500 ring-2 ring-red-300 scale-105 bg-red-100",
                                inactive: "border-red-200 opacity-50",
                                default: "border-red-200 hover:scale-105 hover:bg-red-100"
                            })}`}
                        >
                            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-medium text-red-700">ご確認ください {criticalCount}</span>
                        </button>
                    )}
                    {highCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("high")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-orange-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("high", {
                                active: "border-orange-500 ring-2 ring-orange-300 scale-105 bg-orange-100",
                                inactive: "border-orange-200 opacity-50",
                                default: "border-orange-200 hover:scale-105 hover:bg-orange-100"
                            })}`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-medium text-orange-700">確認をおすすめ {highCount}</span>
                        </button>
                    )}
                    {mediumCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("medium")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-yellow-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("medium", {
                                active: "border-yellow-500 ring-2 ring-yellow-300 scale-105 bg-yellow-100",
                                inactive: "border-yellow-200 opacity-50",
                                default: "border-yellow-200 hover:scale-105 hover:bg-yellow-100"
                            })}`}
                        >
                            <span className="text-xs font-medium text-yellow-700">ご参考まで {mediumCount}</span>
                        </button>
                    )}
                    {lowCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("low")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-blue-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("low", {
                                active: "border-blue-500 ring-2 ring-blue-300 scale-105 bg-blue-100",
                                inactive: "border-blue-200 opacity-50",
                                default: "border-blue-200 hover:scale-105 hover:bg-blue-100"
                            })}`}
                        >
                            <span className="text-xs font-medium text-blue-600">あると安心 {lowCount}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
