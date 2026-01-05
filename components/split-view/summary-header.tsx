"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { AlertTriangle, AlertOctagon, FileText, BarChart3 } from "lucide-react";

interface SummaryHeaderProps {
    data: EnhancedAnalysisResult;
}

export function SummaryHeader({ data }: SummaryHeaderProps) {
    // Count risks by level
    const criticalCount = data.risks.filter(r => r.risk_level === "critical").length;
    const highCount = data.risks.filter(r => r.risk_level === "high").length;
    const mediumCount = data.risks.filter(r => r.risk_level === "medium").length;
    const lowCount = data.risks.filter(r => r.risk_level === "low").length;

    // Calculate simple score (100 - weighted deductions)
    const score = Math.max(0, 100 - (criticalCount * 25) - (highCount * 15) - (mediumCount * 5) - (lowCount * 2));

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                {/* Score Circle */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#e2e8f0"
                                strokeWidth="4"
                                fill="none"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444"}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(score / 100) * 176} 176`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-slate-800">{score}</span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-wider">SCORE</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-slate-800 mb-1">
                            チェック結果
                            <span className="ml-2 text-slate-400 font-normal">{data.risks.length}箇所をチェック</span>
                        </h2>
                    </div>
                </div>

                {/* Risk Level Legend */}
                <div className="flex items-center gap-3 shrink-0">
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                            <AlertOctagon className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700">最優先 {criticalCount}</span>
                        </div>
                    )}
                    {highCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-600">要注意 {highCount}</span>
                        </div>
                    )}
                    {mediumCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-xs font-semibold text-yellow-700">確認 {mediumCount}</span>
                        </div>
                    )}
                    {lowCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                            <span className="text-xs font-semibold text-green-700">参考 {lowCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
