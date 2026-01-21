"use client";

import { cn } from "@/lib/utils";
import { X, ArrowRight, Edit3, AlertTriangle, AlertOctagon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiffMetadata, DiffType } from "./corrected-contract-reader";

interface DiffBottomSheetProps {
    diff: DiffMetadata | null;
    onClose: () => void;
    onEdit?: (diff: DiffMetadata) => void;
    onApply?: (diff: DiffMetadata) => void;
}

const getTypeLabel = (type: DiffType) => {
    switch (type) {
        case "modified": return "修正";
        case "added": return "追記";
        case "deleted": return "削除";
        case "risk_remaining": return "未修正";
    }
};

const getTypeColor = (type: DiffType) => {
    switch (type) {
        case "modified": return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "added": return "bg-blue-100 text-blue-700 border-blue-200";
        case "deleted": return "bg-red-100 text-red-700 border-red-200";
        case "risk_remaining": return "bg-red-100 text-red-700 border-red-200";
    }
};

const getRiskIcon = (level: string) => {
    switch (level) {
        case "critical":
            return <AlertOctagon className="w-4 h-4 text-red-500" />;
        case "high":
            return <AlertTriangle className="w-4 h-4 text-orange-500" />;
        case "medium":
            return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
        default:
            return <Check className="w-4 h-4 text-blue-500" />;
    }
};

export function DiffBottomSheet({ diff, onClose, onEdit, onApply }: DiffBottomSheetProps) {
    if (!diff) return null;

    const isRiskRemaining = diff.type === "risk_remaining";

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        {getRiskIcon(diff.riskLevel)}
                        <div>
                            <span className={cn(
                                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                getTypeColor(diff.type)
                            )}>
                                {getTypeLabel(diff.type)}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Reason */}
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-2">
                            修正の理由
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {diff.reason}
                        </p>
                    </div>

                    {/* Diff Comparison */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-foreground">
                            変更内容
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Before (Always show original) */}
                            {diff.originalText && (
                                <div className={cn(
                                    "rounded-xl p-4 border",
                                    isRiskRemaining ? "bg-red-50 border-red-100 ring-2 ring-red-200" : "bg-red-50/50 border-red-100"
                                )}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-red-600 uppercase">
                                            {isRiskRemaining ? "現在の状態 (リスクあり)" : "Before"}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm text-red-900 leading-relaxed",
                                        !isRiskRemaining && "line-through opacity-70"
                                    )}>
                                        {diff.originalText}
                                    </p>
                                </div>
                            )}

                            {/* After */}
                            {diff.type !== "deleted" && (
                                <div className={cn(
                                    "rounded-xl p-4 border",
                                    isRiskRemaining ? "opacity-50 grayscale" : (
                                        diff.type === "modified"
                                            ? "bg-yellow-50 border-yellow-100"
                                            : "bg-blue-50 border-blue-100"
                                    )
                                )}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={cn(
                                            "text-xs font-bold uppercase",
                                            diff.type === "modified" ? "text-yellow-600" : "text-blue-600"
                                        )}>
                                            {isRiskRemaining ? "修正案 (未適用)" : "After"}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm leading-relaxed",
                                        diff.type === "modified" ? "text-yellow-900" : "text-blue-900"
                                    )}>
                                        {diff.correctedText}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        {!isRiskRemaining && (
                            <Button
                                variant="outline"
                                onClick={() => onEdit?.(diff)}
                                className="flex-1 rounded-full border-primary/20 hover:bg-primary/5"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                元に戻す
                            </Button>
                        )}
                        <Button
                            onClick={() => onApply?.(diff)}
                            className={cn(
                                "flex-1 rounded-full text-white",
                                isRiskRemaining
                                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg scale-105 transition-all"
                                    : "bg-primary hover:bg-primary/90"
                            )}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {isRiskRemaining ? "この修正を適用する" : "修正を適用済み"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
