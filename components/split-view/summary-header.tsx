"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { AlertTriangle, AlertOctagon, FileText, X, Shield, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiskLevelFilter = "critical" | "high" | "medium" | "low" | null;

interface SummaryHeaderProps {
    data: EnhancedAnalysisResult;
    contractType?: string;
    activeFilter?: RiskLevelFilter;
    onFilterChange?: (filter: RiskLevelFilter) => void;
    on28CheckClick?: () => void;
    onShareClick?: () => void;  // 共有ボタンのコールバック
    onSaveClick?: () => void;   // 保存ボタンのコールバック
    isSaved?: boolean;          // 保存済みステータス
}

export function SummaryHeader({ data, contractType, activeFilter, onFilterChange, on28CheckClick, onShareClick, onSaveClick, isSaved, checkpointResult }: SummaryHeaderProps & { checkpointResult?: any }) {
    // Count risks from actual data.risks array (Single Source of Truth with displayed cards)
    // This ensures consistency between header counts and displayed cards
    const criticalCount = data.risks.filter(r => r.risk_level === "critical").length;
    const highCount = data.risks.filter(r => r.risk_level === "high").length;
    const mediumCount = data.risks.filter(r => r.risk_level === "medium").length;
    const lowCount = data.risks.filter(r => r.risk_level === "low").length;

    // Warning = High + Medium (matching the CHECK badge display)
    const warningCount = highCount + mediumCount;

    // Total issues found (Critical + Warning, excluding low/"あるとよい")
    const totalIssues = criticalCount + warningCount;

    const handleFilterClick = (level: RiskLevelFilter) => {
        if (!onFilterChange) return;
        if (activeFilter === level) {
            onFilterChange(null);
        } else {
            onFilterChange(level);
        }
    };

    return (
        <div className="bg-background px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                {/* Summary Title */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            解析完了
                            <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                                {contractType || "契約書"}
                            </span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {totalIssues > 0
                                ? `${totalIssues}箇所の修正・確認ポイントが見つかりました`
                                : "大きな問題は見つかりませんでした"}
                        </p>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-3">
                    {/* Critical */}
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                            <AlertOctagon className="w-4 h-4 text-red-600" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">CRITICAL</span>
                                <span className="text-sm font-bold text-red-700">{criticalCount}件</span>
                            </div>
                        </div>
                    )}

                    {/* Warning (Check) */}
                    {warningCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">CHECK</span>
                                <span className="text-sm font-bold text-amber-700">{warningCount}件</span>
                            </div>
                        </div>
                    )}

                    {/* Low (Recommended - あるとよい) */}
                    {lowCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <Check className="w-4 h-4 text-blue-600" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">推奨</span>
                                <span className="text-sm font-bold text-blue-700">{lowCount}件</span>
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-200 mx-2" />

                    {/* Actions */}
                    <button
                        onClick={on28CheckClick}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-sm hover:bg-primary/90 hover:scale-[1.02] transition-all"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-bold">28項目一覧</span>
                    </button>

                    {/* 共有ボタン */}
                    {onShareClick && (
                        <button
                            onClick={onShareClick}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-primary/20 text-primary rounded-full shadow-sm hover:bg-primary/5 hover:scale-105 transition-all"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">共有</span>
                        </button>
                    )}

                    {/* 保存ボタン (Save) - NEW */}
                    {onSaveClick && (
                        <button
                            onClick={onSaveClick}
                            disabled={isSaved}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full shadow-sm transition-all ${isSaved
                                ? "bg-slate-100 text-slate-500 cursor-default"
                                : "bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-md"
                                }`}
                        >
                            {isSaved ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">保存済み</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">結果を保存</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

