"use client";

import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { AlertTriangle, AlertOctagon, FileText, Sparkles } from "lucide-react";

interface SummaryHeaderProps {
    data: EnhancedAnalysisResult;
    contractType?: string;
}

export function SummaryHeader({ data, contractType }: SummaryHeaderProps) {
    // Count risks by level
    const criticalCount = data.risks.filter(r => r.risk_level === "critical").length;
    const highCount = data.risks.filter(r => r.risk_level === "high").length;
    const mediumCount = data.risks.filter(r => r.risk_level === "medium").length;
    const lowCount = data.risks.filter(r => r.risk_level === "low").length;

    // Calculate simple score (100 - weighted deductions)
    const score = Math.max(0, 100 - (criticalCount * 25) - (highCount * 15) - (mediumCount * 5) - (lowCount * 2));

    // Playful score message
    const getScoreMessage = () => {
        if (score >= 80) return { emoji: "🌟", text: "とても良い契約書です！" };
        if (score >= 60) return { emoji: "👍", text: "いくつか確認ポイントがあります" };
        if (score >= 40) return { emoji: "🔍", text: "確認が必要な箇所があります" };
        return { emoji: "⚠️", text: "慎重に確認してください" };
    };

    const scoreMessage = getScoreMessage();

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
                            <span className="text-lg">{scoreMessage.emoji}</span>
                            <h2 className="text-base font-bold text-slate-800">
                                チェック完了！
                            </h2>
                            <Sparkles className="w-4 h-4 text-amber-400 animate-float" />
                        </div>
                        <p className="text-sm text-slate-600">
                            {scoreMessage.text}
                            <span className="ml-2 text-slate-400">— {data.risks.filter(r => r.risk_level !== "low").length}件の要確認</span>
                        </p>
                        {/* Contract Type Badge */}
                        {contractType && contractType !== "不明" && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 text-slate-600 text-xs rounded-full border border-slate-200 shadow-sm">
                                    <FileText className="w-3 h-3" />
                                    {contractType}として解析
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Level Legend - Playful Pills */}
                <div className="flex items-center gap-2 shrink-0">
                    {criticalCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full shadow-sm card-hover-lift">
                            <AlertOctagon className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700">🔥 特に大事 {criticalCount}</span>
                        </div>
                    )}
                    {highCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-full shadow-sm card-hover-lift">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-600">⚠️ 確認推奨 {highCount}</span>
                        </div>
                    )}
                    {mediumCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full shadow-sm card-hover-lift">
                            <span className="text-xs font-semibold text-yellow-700">💡 ご参考 {mediumCount}</span>
                        </div>
                    )}
                    {lowCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm card-hover-lift">
                            <span className="text-xs font-semibold text-green-700">✅ 問題なし {lowCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

