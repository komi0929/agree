"use client";

import { useState, useMemo } from "react";
import { EnhancedRisk } from "@/lib/types/analysis";
import { Check, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanBoardUIProps {
    risks: EnhancedRisk[];
    onAccept: (index: number) => void;
    onReject: (index: number) => void;
    onReset: (index: number) => void;
    acceptedIndices: number[];
    rejectedIndices: number[];
}

type Column = "pending" | "accepted" | "rejected";

export function KanbanBoardUI({
    risks,
    onAccept,
    onReject,
    onReset,
    acceptedIndices,
    rejectedIndices,
}: KanbanBoardUIProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<Column | null>(null);

    // Categorize risks
    const columns = useMemo(() => {
        const pending: number[] = [];
        const accepted: number[] = [];
        const rejected: number[] = [];

        risks.forEach((_, index) => {
            if (acceptedIndices.includes(index)) {
                accepted.push(index);
            } else if (rejectedIndices.includes(index)) {
                rejected.push(index);
            } else {
                pending.push(index);
            }
        });

        return { pending, accepted, rejected };
    }, [risks, acceptedIndices, rejectedIndices]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, column: Column) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(column);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, column: Column) => {
        e.preventDefault();
        if (draggedIndex !== null) {
            if (column === "accepted") {
                onAccept(draggedIndex);
            } else if (column === "rejected") {
                onReject(draggedIndex);
            } else {
                onReset(draggedIndex);
            }
        }
        setDraggedIndex(null);
        setDragOverColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverColumn(null);
    };

    const getRiskLevelColor = (level?: string) => {
        switch (level) {
            case "critical": return "border-l-red-500";
            case "high": return "border-l-orange-500";
            case "medium": return "border-l-yellow-500";
            default: return "border-l-blue-500";
        }
    };

    const getRiskLevelBadge = (level?: string) => {
        switch (level) {
            case "critical": return "bg-red-100 text-red-700";
            case "high": return "bg-orange-100 text-orange-700";
            case "medium": return "bg-yellow-100 text-yellow-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    const renderCard = (index: number, isDragging: boolean = false) => {
        const risk = risks[index];
        return (
            <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                    "bg-white rounded-lg border border-slate-200 p-3 mb-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow transition-shadow",
                    "border-l-4",
                    getRiskLevelColor(risk.risk_level),
                    isDragging && "opacity-50"
                )}
            >
                <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                            <span className={cn("text-[9px] font-bold uppercase px-1 py-0.5 rounded", getRiskLevelBadge(risk.risk_level))}>
                                {risk.risk_level}
                            </span>
                        </div>
                        <h4 className="text-xs font-medium text-foreground line-clamp-2">
                            {risk.section_title}
                        </h4>
                    </div>
                </div>
            </div>
        );
    };

    const renderColumn = (
        title: string,
        column: Column,
        indices: number[],
        icon: React.ReactNode,
        headerClass: string
    ) => (
        <div className="flex-1 flex flex-col min-w-0">
            {/* Column Header */}
            <div className={cn("px-3 py-2 rounded-t-lg flex items-center gap-2", headerClass)}>
                {icon}
                <span className="text-sm font-bold">{title}</span>
                <span className="text-xs opacity-70">({indices.length})</span>
            </div>

            {/* Column Body */}
            <div
                onDragOver={(e) => handleDragOver(e, column)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column)}
                className={cn(
                    "flex-1 p-2 bg-slate-50 rounded-b-lg border-2 border-dashed transition-colors min-h-[200px] overflow-y-auto",
                    dragOverColumn === column ? "border-primary bg-primary/5" : "border-transparent"
                )}
            >
                {indices.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        ここにドロップ
                    </div>
                ) : (
                    indices.map(i => renderCard(i, draggedIndex === i))
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4">
            {/* Progress */}
            <div className="mb-4 text-center text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">{acceptedIndices.length}</span> 採用
                <span className="mx-2">・</span>
                <span className="text-slate-500 font-medium">{rejectedIndices.length}</span> 却下
                <span className="mx-2">・</span>
                <span className="text-primary font-medium">{columns.pending.length}</span> 未確認
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {renderColumn(
                    "未確認",
                    "pending",
                    columns.pending,
                    <div className="w-4 h-4 rounded-full bg-slate-300" />,
                    "bg-slate-200 text-slate-700"
                )}
                {renderColumn(
                    "採用",
                    "accepted",
                    columns.accepted,
                    <Check className="w-4 h-4 text-green-700" />,
                    "bg-green-100 text-green-700"
                )}
                {renderColumn(
                    "却下",
                    "rejected",
                    columns.rejected,
                    <X className="w-4 h-4 text-slate-500" />,
                    "bg-slate-200 text-slate-500"
                )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-xs text-muted-foreground">
                カードをドラッグ＆ドロップで分類してください
            </div>
        </div>
    );
}
