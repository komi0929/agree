"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { AlertTriangle, AlertOctagon, FileText, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiskLevelFilter = "critical" | "high" | "medium" | "low" | null;

interface SummaryHeaderProps {
    data: EnhancedAnalysisResult;
    contractType?: string;
    activeFilter?: RiskLevelFilter;
    onFilterChange?: (filter: RiskLevelFilter) => void;
    on28CheckClick?: () => void;  // 28項目チェックボタンのコールバック
}

export function SummaryHeader({ data, contractType, activeFilter, onFilterChange, on28CheckClick }: SummaryHeaderProps) {
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
        <div className="bg-background border-b border-primary/10 px-6 py-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                {/* Summary without score - 確認事項のサマリー */}
                <div className="flex items-center gap-5">
                    {/* Status indicator */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className={cn(
                            "absolute inset-0 rounded-full blur-md opacity-50",
                            criticalCount > 0 ? "bg-red-100" : highCount > 0 ? "bg-orange-100" : "bg-emerald-100"
                        )} />
                        <div className={cn(
                            "relative z-10 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2",
                            criticalCount > 0 ? "border-red-400 bg-red-50" : highCount > 0 ? "border-orange-400 bg-orange-50" : "border-emerald-400 bg-emerald-50"
                        )}>
                            <span className="text-xl font-bold text-foreground">{data.risks.filter(r => r.risk_level !== "low").length}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">件</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-foreground">
                                {criticalCount > 0 ? "確認が必要な項目があります" : highCount > 0 ? "いくつか確認したい点があります" : "おおむね問題ありません"}
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {criticalCount > 0 && <span className="text-red-500 font-medium mr-2">重要 {criticalCount}件</span>}
                            {highCount > 0 && <span className="text-orange-500 font-medium mr-2">確認推奨 {highCount}件</span>}
                            {mediumCount > 0 && <span className="text-amber-500 font-medium mr-2">参考 {mediumCount}件</span>}
                            {lowCount > 0 && <span className="text-primary font-medium">推奨 {lowCount}件</span>}
                        </p>
                        {/* Contract Type Badge */}
                        {contractType && contractType !== "不明" && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 text-muted-foreground text-xs rounded-full border border-primary/20 shadow-sm">
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
                            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-white border border-primary/20 rounded-full shadow-sm transition-all"
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
                            className={`flex items-center gap-1.5 px-3 py-2 bg-amber-50 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("medium", {
                                active: "border-amber-500 ring-2 ring-amber-300 scale-105 bg-amber-100",
                                inactive: "border-amber-200 opacity-50",
                                default: "border-amber-200 hover:scale-105 hover:bg-amber-100"
                            })}`}
                        >
                            <span className="text-xs font-medium text-amber-700">ご参考まで {mediumCount}</span>
                        </button>
                    )}
                    {lowCount > 0 && (
                        <button
                            onClick={() => handleFilterClick("low")}
                            className={`flex items-center gap-1.5 px-3 py-2 bg-primary/5 border rounded-full shadow-sm transition-all cursor-pointer ${getPillClasses("low", {
                                active: "border-primary ring-2 ring-primary/30 scale-105 bg-primary/10",
                                inactive: "border-primary/20 opacity-50",
                                default: "border-primary/20 hover:scale-105 hover:bg-primary/10"
                            })}`}
                        >
                            <span className="text-xs font-medium text-primary">あると安心 {lowCount}</span>
                        </button>
                    )}

                    {/* 分離線 */}
                    <div className="w-px h-6 bg-primary/20 mx-1" />

                    {/* 28項目チェックボタン */}
                    <button
                        onClick={on28CheckClick}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 hover:scale-105 transition-all"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">28項目チェック</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
