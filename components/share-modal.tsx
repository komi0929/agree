"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import {
    Share2,
    Copy,
    Check,
    FileText,
    Link2,
    X,
    Download,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    analysisData: EnhancedAnalysisResult;
    contractText: string;
    contractType?: string;
}

export function ShareModal({
    open,
    onClose,
    analysisData,
    contractText,
    contractType
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<"summary" | "full">("summary");

    if (!open) return null;

    // Generate shareable summary text
    const generateSummaryText = () => {
        const criticalCount = analysisData.risks.filter(r => r.risk_level === "critical").length;
        const highCount = analysisData.risks.filter(r => r.risk_level === "high").length;
        const mediumCount = analysisData.risks.filter(r => r.risk_level === "medium").length;

        let summary = `【契約書チェック結果】\n`;
        summary += `契約種別: ${contractType || "不明"}\n`;
        summary += `確認事項: ${analysisData.risks.filter(r => r.risk_level !== "low").length}件\n`;
        summary += `（重要: ${criticalCount}件 / 確認推奨: ${highCount}件 / 参考: ${mediumCount}件）\n\n`;

        if (criticalCount > 0 || highCount > 0) {
            summary += `【要確認事項】\n`;
            analysisData.risks
                .filter(r => r.risk_level === "critical" || r.risk_level === "high")
                .forEach((risk, i) => {
                    const levelLabel = risk.risk_level === "critical" ? "🔴" : "🟠";
                    summary += `${levelLabel} ${risk.section_title}\n`;
                    summary += `   ${risk.explanation.split("。")[0]}。\n`;
                });
        }

        summary += `\n---\nagreeで契約書をチェック`;

        return summary;
    };

    // Generate full report text
    const generateFullReportText = () => {
        let report = `━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `📋 契約書チェックレポート\n`;
        report += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        report += `契約種別: ${contractType || "不明"}\n`;
        report += `チェック日時: ${new Date().toLocaleString("ja-JP")}\n\n`;

        const criticalRisks = analysisData.risks.filter(r => r.risk_level === "critical");
        const highRisks = analysisData.risks.filter(r => r.risk_level === "high");
        const mediumRisks = analysisData.risks.filter(r => r.risk_level === "medium");
        const lowRisks = analysisData.risks.filter(r => r.risk_level === "low");

        if (criticalRisks.length > 0) {
            report += `🔴 重要事項（${criticalRisks.length}件）\n`;
            report += `─────────────────────\n`;
            criticalRisks.forEach((risk, i) => {
                report += `${i + 1}. ${risk.section_title}\n`;
                report += `   ${risk.explanation}\n`;
                if (risk.suggestion.revised_text) {
                    report += `   💡 修正案: ${risk.suggestion.revised_text}\n`;
                }
                report += `\n`;
            });
        }

        if (highRisks.length > 0) {
            report += `🟠 確認推奨事項（${highRisks.length}件）\n`;
            report += `─────────────────────\n`;
            highRisks.forEach((risk, i) => {
                report += `${i + 1}. ${risk.section_title}\n`;
                report += `   ${risk.explanation}\n`;
                if (risk.suggestion.revised_text) {
                    report += `   💡 修正案: ${risk.suggestion.revised_text}\n`;
                }
                report += `\n`;
            });
        }

        if (mediumRisks.length > 0) {
            report += `🟡 参考事項（${mediumRisks.length}件）\n`;
            report += `─────────────────────\n`;
            mediumRisks.forEach((risk, i) => {
                report += `${i + 1}. ${risk.section_title}: ${risk.explanation.split("。")[0]}。\n`;
            });
            report += `\n`;
        }

        if (lowRisks.length > 0) {
            report += `🔵 推奨事項（${lowRisks.length}件）\n`;
            report += `─────────────────────\n`;
            lowRisks.forEach((risk, i) => {
                report += `${i + 1}. ${risk.section_title}: ${risk.explanation.split("。")[0]}。\n`;
            });
            report += `\n`;
        }

        report += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `Generated by agree - 契約書チェックAI\n`;

        return report;
    };

    const handleCopy = (type: "summary" | "full") => {
        const text = type === "summary" ? generateSummaryText() : generateFullReportText();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadText = () => {
        const text = generateFullReportText();
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `契約書チェックレポート_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent(`【契約書チェック結果】${contractType || "契約書"}`);
        const body = encodeURIComponent(generateSummaryText());
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">結果を共有</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Selector */}
                <div className="flex border-b border-primary/10">
                    <button
                        onClick={() => setActiveTab("summary")}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === "summary"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        サマリー
                    </button>
                    <button
                        onClick={() => setActiveTab("full")}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            activeTab === "full"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        詳細レポート
                    </button>
                </div>

                {/* Preview Area */}
                <div className="p-4">
                    <div className="bg-muted/30 rounded-xl p-4 max-h-60 overflow-y-auto">
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {activeTab === "summary" ? generateSummaryText() : generateFullReportText()}
                        </pre>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3 border-t border-primary/10">
                    {/* Main Copy Button */}
                    <Button
                        onClick={() => handleCopy(activeTab)}
                        className="w-full bg-primary hover:bg-primary/90"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                コピーしました！
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                テキストをコピー
                            </>
                        )}
                    </Button>

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadText}
                            className="flex-1 border-primary/20 hover:bg-primary/5"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            ダウンロード
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleEmailShare}
                            className="flex-1 border-primary/20 hover:bg-primary/5"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            メールで送信
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
