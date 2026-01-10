"use client";

import { useState, useEffect } from "react";
import { CheckpointItem, CheckpointResult } from "@/lib/rules/checkpoints-28";
import { Check, AlertTriangle, AlertOctagon, Minus, ChevronDown, ChevronUp, Shield, Lightbulb, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChecklistPanelProps {
    result: CheckpointResult;
    onClose: () => void;
    onItemClick?: (itemNo: number) => void;
}

export function ChecklistPanel({ result, onClose, onItemClick }: ChecklistPanelProps) {
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [filter, setFilter] = useState<"all" | "issues" | "clear">("all");

    const toggleExpanded = (itemNo: number) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemNo)) {
                next.delete(itemNo);
            } else {
                next.add(itemNo);
            }
            return next;
        });
    };

    const getStatusIcon = (status: CheckpointItem["status"]) => {
        switch (status) {
            case "clear":
                return <Check className="w-4 h-4 text-emerald-600" />;
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case "critical":
                return <AlertOctagon className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusStyle = (status: CheckpointItem["status"]) => {
        switch (status) {
            case "clear":
                return "bg-emerald-50 border-emerald-200";
            case "warning":
                return "bg-amber-50 border-amber-200";
            case "critical":
                return "bg-red-50 border-red-200";
            default:
                return "bg-slate-50 border-slate-200";
        }
    };

    const filteredItems = result.items.filter(item => {
        if (filter === "all") return true;
        if (filter === "issues") return item.status !== "clear";
        if (filter === "clear") return item.status === "clear";
        return true;
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">28項目チェック</h2>
                                <p className="text-xs text-slate-500">契約書の重要ポイントを100%正確にチェック</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Summary Stats */}
                    <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">{result.summary.clear} クリア</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-700">{result.summary.warning} 確認推奨</span>
                        </div>
                        {result.summary.critical > 0 && (
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700">{result.summary.critical} 重大</span>
                            </div>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === "all"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            すべて ({result.items.length})
                        </button>
                        <button
                            onClick={() => setFilter("issues")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === "issues"
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                }`}
                        >
                            要確認 ({result.summary.warning + result.summary.critical})
                        </button>
                        <button
                            onClick={() => setFilter("clear")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === "clear"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                }`}
                        >
                            クリア ({result.summary.clear})
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-auto p-4 space-y-2">
                    {filteredItems.map((item) => {
                        const isExpanded = expandedItems.has(item.item_no);
                        const hasDetails = item.message || item.suggestion;

                        return (
                            <div
                                key={item.id}
                                className={`rounded-xl border transition-all ${getStatusStyle(item.status)}`}
                            >
                                {/* Item Header */}
                                <div
                                    className={`p-4 flex items-center gap-3 ${hasDetails ? "cursor-pointer" : ""}`}
                                    onClick={() => hasDetails && toggleExpanded(item.item_no)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0">
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 font-mono">#{item.item_no.toString().padStart(2, "0")}</span>
                                            <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                                        </div>
                                        {item.status === "clear" && (
                                            <p className="text-xs text-emerald-600">問題ありません</p>
                                        )}
                                        {item.status !== "clear" && item.message && (
                                            <p className="text-xs text-slate-600 line-clamp-1">{item.message}</p>
                                        )}
                                    </div>
                                    {hasDetails && (
                                        <button className="p-1 text-slate-400">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && hasDetails && (
                                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2">
                                        {item.message && (
                                            <div className="bg-white rounded-lg p-3 border border-slate-200">
                                                <p className="text-xs text-slate-500 mb-1">問題</p>
                                                <p className="text-sm text-slate-700">{item.message}</p>
                                            </div>
                                        )}

                                        {item.suggestion && (
                                            <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                                                    <p className="text-xs text-emerald-600 font-medium">おすすめの対策</p>
                                                </div>
                                                <p className="text-sm text-slate-700">{item.suggestion}</p>
                                                {item.benefit && (
                                                    <p className="text-xs text-slate-500 mt-2">💡 {item.benefit}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            ルールベースで100%正確にチェック
                        </p>
                        <Button
                            onClick={onClose}
                            className="bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            閉じる
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
