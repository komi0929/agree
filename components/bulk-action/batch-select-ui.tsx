"use client";

import { useState, useMemo } from "react";
import { EnhancedRisk } from "@/lib/types/analysis";
import { Check, X, Square, CheckSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BatchSelectUIProps {
    risks: EnhancedRisk[];
    onAccept: (indices: number[]) => void;
    onReject: (indices: number[]) => void;
    acceptedIndices: number[];
    rejectedIndices: number[];
}

type RiskFilter = "all" | "critical" | "high" | "medium" | "low";

export function BatchSelectUI({
    risks,
    onAccept,
    onReject,
    acceptedIndices,
    rejectedIndices,
}: BatchSelectUIProps) {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [filter, setFilter] = useState<RiskFilter>("all");

    // Filter risks
    const filteredRisks = useMemo(() => {
        return risks
            .map((risk, index) => ({ risk, index }))
            .filter(({ risk }) => {
                if (filter === "all") return true;
                return risk.risk_level === filter;
            });
    }, [risks, filter]);

    // Unprocessed risks
    const unprocessedFiltered = filteredRisks.filter(
        ({ index }) => !acceptedIndices.includes(index) && !rejectedIndices.includes(index)
    );

    const toggleSelect = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const selectAll = () => {
        setSelectedIndices(unprocessedFiltered.map(({ index }) => index));
    };

    const selectNone = () => {
        setSelectedIndices([]);
    };

    const selectCriticalOnly = () => {
        setSelectedIndices(
            filteredRisks
                .filter(({ risk, index }) => risk.risk_level === "critical" && !acceptedIndices.includes(index) && !rejectedIndices.includes(index))
                .map(({ index }) => index)
        );
    };

    const handleAcceptSelected = () => {
        if (selectedIndices.length > 0) {
            onAccept(selectedIndices);
            setSelectedIndices([]);
        }
    };

    const handleRejectSelected = () => {
        if (selectedIndices.length > 0) {
            onReject(selectedIndices);
            setSelectedIndices([]);
        }
    };

    const getRiskLevelBadge = (level?: string) => {
        switch (level) {
            case "critical": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
            case "high": return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" };
            case "medium": return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" };
            default: return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
        }
    };

    const getStatusBadge = (index: number) => {
        if (acceptedIndices.includes(index)) {
            return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">採用</span>;
        }
        if (rejectedIndices.includes(index)) {
            return <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 line-through">却下</span>;
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with filters and actions */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Selection controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAll}
                            className="text-xs"
                        >
                            <CheckSquare className="w-3 h-3 mr-1" />
                            全選択
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectNone}
                            className="text-xs"
                        >
                            <Square className="w-3 h-3 mr-1" />
                            解除
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectCriticalOnly}
                            className="text-xs text-red-600"
                        >
                            CRITICALのみ
                        </Button>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3 text-muted-foreground" />
                        {(["all", "critical", "high", "medium", "low"] as RiskFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "text-xs px-2 py-1 rounded transition-colors",
                                    filter === f
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {f === "all" ? "すべて" : f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk actions */}
                {selectedIndices.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-primary/5 rounded-lg">
                        <span className="text-sm font-medium text-foreground">
                            {selectedIndices.length}件選択中
                        </span>
                        <div className="flex-1" />
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={handleRejectSelected}
                        >
                            <X className="w-4 h-4 mr-1" />
                            却下
                        </Button>
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleAcceptSelected}
                        >
                            <Check className="w-4 h-4 mr-1" />
                            採用
                        </Button>
                    </div>
                )}
            </div>

            {/* Progress summary */}
            <div className="px-4 py-2 bg-slate-50 border-b text-xs text-muted-foreground flex items-center gap-4">
                <span>合計: {risks.length}件</span>
                <span className="text-green-600">採用: {acceptedIndices.length}件</span>
                <span className="text-slate-500">却下: {rejectedIndices.length}件</span>
                <span className="text-primary">未処理: {risks.length - acceptedIndices.length - rejectedIndices.length}件</span>
            </div>

            {/* Risk list */}
            <div className="flex-1 overflow-y-auto">
                {filteredRisks.map(({ risk, index }) => {
                    const isSelected = selectedIndices.includes(index);
                    const isProcessed = acceptedIndices.includes(index) || rejectedIndices.includes(index);
                    const badge = getRiskLevelBadge(risk.risk_level);

                    return (
                        <div
                            key={index}
                            onClick={() => !isProcessed && toggleSelect(index)}
                            className={cn(
                                "flex items-start gap-3 p-4 border-b border-slate-100 cursor-pointer transition-colors",
                                isSelected && "bg-primary/5",
                                isProcessed && "opacity-50 cursor-default bg-slate-50"
                            )}
                        >
                            {/* Checkbox */}
                            <div className="pt-1">
                                {isProcessed ? (
                                    <div className="w-5 h-5" />
                                ) : isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-primary" />
                                ) : (
                                    <Square className="w-5 h-5 text-slate-300" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded", badge.bg, badge.text)}>
                                        {risk.risk_level}
                                    </span>
                                    {getStatusBadge(index)}
                                </div>
                                <h4 className="text-sm font-medium text-foreground truncate">
                                    {risk.section_title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {risk.explanation}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
