"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { SummaryHeader } from "@/components/split-view/summary-header";
import { ContractViewer } from "@/components/split-view/contract-viewer";
import { RiskPanel } from "@/components/split-view/risk-panel";
import { MessageCrafter } from "@/components/split-view/message-crafter";
import { EngagementModal } from "@/components/engagement-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Send, Sparkles, Loader2, X } from "lucide-react";
import { modifyContractAction } from "@/app/generate/actions";
import { ContractInput, DEFAULT_CONTRACT_OPTIONS } from "@/lib/types/contract-input";

interface AnalysisViewerProps {
    data: EnhancedAnalysisResult;
    text: string;
}

export function AnalysisViewer({ data, text }: AnalysisViewerProps) {
    const router = useRouter();
    const [highlightedRiskIndex, setHighlightedRiskIndex] = useState<number | null>(null);
    const [selectedRiskIndex, setSelectedRiskIndex] = useState<number | null>(null);
    const [selectedRiskIndices, setSelectedRiskIndices] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<"contract" | "message">("contract");
    const [showEngagement, setShowEngagement] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Toggle risk selection
    const handleRiskToggle = useCallback((index: number) => {
        setSelectedRiskIndices(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    }, []);

    // When a risk card is clicked
    const handleRiskSelect = useCallback((index: number) => {
        // Just highlight, don't auto-switch to message mode anymore
        // unless explicitly requested via action
        setSelectedRiskIndex(index);
        setHighlightedRiskIndex(index);
    }, []);

    // Scroll to contract highlight
    const handleScrollToContract = useCallback((index: number) => {
        setHighlightedRiskIndex(index);
        setViewMode("contract");
    }, []);

    const handleHighlightClick = useCallback((index: number) => {
        setHighlightedRiskIndex(index);
    }, []);

    const handleFinish = () => {
        setShowEngagement(true);
    };

    // Generate new contract based on selected risks
    const handleGenerateNewContract = async () => {
        if (selectedRiskIndices.length === 0) return;
        setIsGenerating(true);

        try {
            // Collect all instructions
            const instructions = selectedRiskIndices
                .map(index => {
                    const risk = data.risks[index];
                    return `- ${risk.section_title}: ${risk.suggestion.revised_text}`;
                })
                .join("\n");

            const fullInstruction = `以下の修正点を反映してください：\n${instructions}`;

            // Determine contract input context
            let input: ContractInput;
            try {
                const stored = sessionStorage.getItem("contractInput");
                input = stored ? JSON.parse(stored) : {
                    clientName: "甲",
                    userName: "乙",
                    amount: 0,
                    deadline: "契約締結時",
                    scopeDescription: "",
                    options: DEFAULT_CONTRACT_OPTIONS,
                };
            } catch {
                input = {
                    clientName: "甲",
                    userName: "乙",
                    amount: 0,
                    deadline: "契約締結時",
                    scopeDescription: "",
                    options: DEFAULT_CONTRACT_OPTIONS,
                };
            }

            const result = await modifyContractAction(text, fullInstruction, input);

            if (result.success && result.markdown) {
                // Save to session storage for the preview page
                sessionStorage.setItem("contractResult", JSON.stringify({
                    markdown: result.markdown,
                    highlightedClauses: []
                }));
                sessionStorage.setItem("contractInput", JSON.stringify(input));

                router.push("/generate/preview");
            } else {
                alert("契約書の生成に失敗しました: " + (result.error || "不明なエラー"));
            }
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearSelection = () => {
        setSelectedRiskIndices([]);
    };

    // Derived values
    const selectedRisks = selectedRiskIndices.map(i => data.risks[i]);

    return (
        <div className="h-screen w-full flex flex-col font-sans bg-slate-100">
            {/* Summary Header */}
            <SummaryHeader data={data} />

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden relative">
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
                                    {selectedRiskIndices.length > 0 ? "一括メッセージ作成" : "メッセージ作成"}
                                </span>
                            </div>
                            <MessageCrafter
                                risk={selectedRiskIndex !== null ? data.risks[selectedRiskIndex] : null}
                                selectedRisks={selectedRisks.length > 0 ? selectedRisks : undefined}
                                onFinish={handleFinish}
                            />
                        </div>
                    )}
                </div>

                {/* Right Pane */}
                <div className="w-full md:w-1/2 h-full flex flex-col bg-slate-50 overflow-hidden relative">
                    <RiskPanel
                        risks={data.risks}
                        highlightedRiskIndex={highlightedRiskIndex}
                        selectedRiskIndices={selectedRiskIndices}
                        onRiskHover={setHighlightedRiskIndex}
                        onRiskSelect={handleRiskSelect}
                        onRiskToggle={handleRiskToggle}
                        onScrollToContract={handleScrollToContract}
                    />

                    {/* Checkbox Floating Action Bar */}
                    {selectedRiskIndices.length > 0 && (
                        <div className="absolute bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                        <CheckSquareIcon className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold">{selectedRiskIndices.length}</span>
                                        <span className="text-xs text-slate-400">個を選択中</span>
                                    </div>
                                    <button
                                        onClick={handleClearSelection}
                                        className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" />
                                        解除
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
                                        onClick={() => setViewMode("message")}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        交渉メッセージ
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-t border-blue-400 font-bold"
                                        onClick={handleGenerateNewContract}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                生成中...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                修正版を作成する
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EngagementModal
                open={showEngagement}
                onClose={() => setShowEngagement(false)}
            />
        </div>
    );
}

function CheckSquareIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    )
}
