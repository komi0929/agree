
import { useState } from "react";
import { EnhancedAnalysisResult } from "@/lib/ai-service";
import { SplitLayout } from "@/components/split-layout";
import { ContractViewer } from "@/components/split-view/contract-viewer";
import { RiskPanel } from "@/components/split-view/risk-panel";
import { MessageCrafter } from "@/components/split-view/message-crafter";
import { EngagementModal } from "@/components/engagement-modal";
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

    const handleRiskSelect = (index: number) => {
        setSelectedRiskIndex(index);
        setHighlightedRiskIndex(index);
        setViewMode("contract");
        // Note: The prompt implies instant message drafting upon "Decision", but maybe we keep it as "contract" 
        // until they explicitly click "Adopt" in the panel.
        // Actually, the RiskPanel button says "Adopt and Draft".
        // So let's handle that in a separate handler passed to RiskPanel.
    };

    const handleAdoptRisk = (index: number) => {
        setSelectedRiskIndex(index);
        setViewMode("message");
    };

    const handleFinish = () => {
        setShowEngagement(true);
    };

    return (
        <div className="h-full w-full font-sans">
            <SplitLayout
                leftPane={
                    viewMode === "contract" ? (
                        <ContractViewer
                            text={text}
                            risks={data.risks}
                            highlightedRiskIndex={highlightedRiskIndex}
                        />
                    ) : (
                        <div className="h-full flex flex-col bg-white">
                            <div className="p-4 border-b border-slate-100 flex items-center">
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
                    )
                }
                rightPane={
                    <RiskPanel
                        risks={data.risks}
                        onRiskHover={setHighlightedRiskIndex}
                        onRiskSelect={handleAdoptRisk} // Changed to trigger message mode directly on click/select
                    />
                }
            />

            <EngagementModal
                open={showEngagement}
                onClose={() => setShowEngagement(false)}
            />
        </div>
    );
}

