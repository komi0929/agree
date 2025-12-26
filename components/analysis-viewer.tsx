"use client";

import { useState, useCallback } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { SummaryHeader } from "@/components/split-view/summary-header";
import { ContractViewer } from "@/components/split-view/contract-viewer";
import { RiskPanel } from "@/components/split-view/risk-panel";
import { MessageCrafter } from "@/components/split-view/message-crafter";
import { EngagementModal } from "@/components/engagement-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AnalysisViewerProps {
    data: EnhancedAnalysisResult;
    text: string;
}

export function AnalysisViewer({ data, text }: AnalysisViewerProps) {
    const [highlightedRiskIndex, setHighlightedRiskIndex] = useState<number | null>(null);
    const [selectedRiskIndex, setSelectedRiskIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"contract" | "message">("contract");
    const [showEngagement, setShowEngagement] = useState(false);

    // When a risk card is clicked in the right panel
    const handleRiskSelect = useCallback((index: number) => {
        setSelectedRiskIndex(index);
        setHighlightedRiskIndex(index);
        // After a brief moment, open message crafter
        setTimeout(() => {
            setViewMode("message");
        }, 300);
    }, []);

    // Scroll to contract highlight when clicking link in risk panel
    const handleScrollToContract = useCallback((index: number) => {
        setHighlightedRiskIndex(index);
        setViewMode("contract");
    }, []);

    // When clicking a highlight in the contract viewer
    const handleHighlightClick = useCallback((index: number) => {
        setHighlightedRiskIndex(index);
    }, []);

    const handleFinish = () => {
        setShowEngagement(true);
    };

    return (
        <div className="h-screen w-full flex flex-col font-sans bg-slate-100">
            {/* Summary Header */}
            <SummaryHeader data={data} />

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane */}
                <div className="w-full md:w-1/2 h-full flex flex-col border-r border-slate-200 bg-white overflow-hidden">
                    {viewMode === "contract" ? (
                        <ContractViewer
                            text={text}
                            risks={data.risks}
                            highlightedRiskIndex={highlightedRiskIndex}
                            onHighlightClick={handleHighlightClick}
                        />
                    ) : (
                        <div className="h-full flex flex-col bg-white">
                            <div className="p-4 border-b border-slate-100 flex items-center bg-white">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("contract")}
                                    className="text-slate-500 hover:text-slate-900"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    契約書に戻る
                                </Button>
                                <span className="ml-4 text-sm font-bold text-slate-800">
                                    {selectedRiskIndex !== null && data.risks[selectedRiskIndex]?.section_title} - 修正案の作成
                                </span>
                            </div>
                            <MessageCrafter
                                risk={selectedRiskIndex !== null ? data.risks[selectedRiskIndex] : null}
                                onFinish={handleFinish}
                            />
                        </div>
                    )}
                </div>

                {/* Right Pane */}
                <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 overflow-hidden">
                    <RiskPanel
                        risks={data.risks}
                        highlightedRiskIndex={highlightedRiskIndex}
                        onRiskHover={setHighlightedRiskIndex}
                        onRiskSelect={handleRiskSelect}
                        onScrollToContract={handleScrollToContract}
                    />
                </div>
            </div>

            <EngagementModal
                open={showEngagement}
                onClose={() => setShowEngagement(false)}
            />
        </div>
    );
}
