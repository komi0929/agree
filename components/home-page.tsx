"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { UploadSection } from "@/components/upload-section";
import { trackEvent, trackPageView, ANALYTICS_EVENTS } from "@/lib/analytics/client";
import { EnhancedAnalysisResult, ExtractionResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SignatureLogo } from "@/components/signature-logo";
import { analyzeDeepAction, AnalysisState } from "@/app/actions";
import { UserContext, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { Loader2, LogIn, Sparkles, Settings2 } from "lucide-react";
import { AnalyzingOverlay } from "@/components/analyzing-overlay";
import { ScoreReveal } from "@/components/score-reveal";
import { CorrectedContractReader, DiffMetadata } from "@/components/corrected-contract-reader";
import { HistorySidebar, useAnalysisHistory } from "@/components/history-sidebar";

import {
    SpeculativeAnalysisCache,
    startSpeculativeAnalysis,
    isContextMatch,
    getContextDiff
} from "@/lib/speculative-analysis";

// Phase 5: Dynamic imports for heavy components (reduces initial bundle)
const AnalysisViewer = dynamic(
    () => import("@/components/analysis-viewer").then(m => ({ default: m.AnalysisViewer })),
    {
        loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    <span className="text-slate-500">結果を表示しています...</span>
                </div>
            </div>
        ),
        ssr: false
    }
);

const UnifiedContextForm = dynamic(
    () => import("@/components/unified-context-form").then(m => ({ default: m.UnifiedContextForm })),
    {
        loading: () => (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        ),
        ssr: false
    }
);

// Helper: Generate corrected text from analysis
function generateCorrectedText(originalText: string, analysis: EnhancedAnalysisResult, rejectedIds: Set<string>): string {
    let correctedText = originalText;

    // Apply suggestions in reverse order to maintain indices
    const sortedRisks = [...analysis.risks]
        .filter(r => r.suggestion?.revised_text && r.original_text)
        .sort((a, b) => {
            const indexA = originalText.indexOf(a.original_text);
            const indexB = originalText.indexOf(b.original_text);
            return indexB - indexA; // Reverse order
        });

    for (const risk of sortedRisks) {
        // Skip if this risk was rejected by user
        if (rejectedIds.has(risk.original_text)) continue;

        if (risk.suggestion?.revised_text && risk.original_text) {
            correctedText = correctedText.replace(risk.original_text, risk.suggestion.revised_text);
        }
    }

    return correctedText;
}

// Helper: Generate diff metadata from analysis

// Calculate real-time score based on accepted/rejected fixes
function calculateCurrentScore(initialScore: number, totalRisks: number, rejectedCount: number): number {
    if (totalRisks === 0) return 100;
    const resolvedCount = totalRisks - rejectedCount;
    // Linear interpolation: Initial -> 100
    const potentialGain = 100 - initialScore;
    const gain = potentialGain * (resolvedCount / totalRisks);
    return Math.min(100, Math.round(initialScore + gain));
}

function generateDiffsFromAnalysis(analysis: EnhancedAnalysisResult, originalText: string, rejectedIds: Set<string>): DiffMetadata[] {
    const diffs: DiffMetadata[] = [];
    let diffIdCounter = 0;

    // Generate corrected text first to get proper indices
    // Note: for "risk_remaining", we still need to map them to the text
    const correctedText = generateCorrectedText(originalText, analysis, rejectedIds);

    for (const risk of analysis.risks) {
        if (!risk.original_text) continue;

        const isRejected = rejectedIds.has(risk.original_text);

        // Find position in the *corrected* text
        // If rejected, the text in correctedText is the ORIGINAL text.
        // If accepted, the text in correctedText is the REVISED text.
        const searchTarget = isRejected ? risk.original_text : risk.suggestion?.revised_text;

        if (!searchTarget) continue;

        // Simple strict search (might fail if duplicates exist, but sufficient for now)
        const startIndex = correctedText.indexOf(searchTarget);
        if (startIndex === -1) continue;

        diffs.push({
            id: `diff-${diffIdCounter++}`,
            type: isRejected ? "risk_remaining" : (risk.suggestion?.revised_text ? "modified" : "deleted"), // Assuming modified for accepted
            startIndex: startIndex,
            endIndex: startIndex + searchTarget.length,
            originalText: risk.original_text,
            correctedText: risk.suggestion?.revised_text || "",
            reason: risk.explanation || "修正が推奨されます",
            riskLevel: risk.risk_level
        });
    }
    return diffs;
}

export function HomePage() {
    const [analysisData, setAnalysisData] = useState<EnhancedAnalysisResult | null>(null);
    const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
    const [contractText, setContractText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    // Full flow: upload -> unified_context -> complete (analyzing happens via overlay)
    const [step, setStep] = useState<"upload" | "unified_context" | "score_reveal" | "complete">("upload");
    // Overlay state for analyzing (now uses Matrix loading)
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Score reveal data
    const [scoreData, setScoreData] = useState<{ score: number; grade: "A" | "B" | "C" | "D" | "F"; topRisks: Array<{ title: string; description: string; level: "critical" | "high" | "medium" }> } | null>(null);

    // Auth Removed - Dummy variables to satisfy legacy code
    const user = null;
    const authLoading = false;
    const [showAuthModal, setShowAuthModal] = useState(false); // Kept to avoid breaking references, but unused
    const [showGateModal, setShowGateModal] = useState(false);

    // History state
    const { saveToHistory, loadFromHistory } = useAnalysisHistory();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();
    const [showSavePrompt, setShowSavePrompt] = useState(false);

    // Store the promise of the deep analysis so we can await it later
    const deepAnalysisPromiseRef = useRef<Promise<AnalysisState> | null>(null);

    // Usage limit hook - Dummy
    const { hasReachedCheckLimit, incrementCheckCount } = { hasReachedCheckLimit: false, incrementCheckCount: async () => true };

    // Track rejected risks (user chose to keep original text)
    const [rejectedRiskIds, setRejectedRiskIds] = useState<Set<string>>(new Set());

    // SPECULATIVE EXECUTION: Cache for pre-computed analysis
    const speculativeCacheRef = useRef<SpeculativeAnalysisCache | null>(null);
    const speculativePromiseRef = useRef<Promise<SpeculativeAnalysisCache | null> | null>(null);

    // Track page view on mount
    useEffect(() => {
        trackPageView();
    }, []);



    const handleAnalysisStart = () => {
        setLoading(true);
        setAnalysisData(null);
        setExtractionData(null);
        setContractText("");
        setStep("upload");
        setCurrentHistoryId(undefined);
        setShowSavePrompt(false);
        setRejectedRiskIds(new Set());
        // Clear speculative cache
        speculativeCacheRef.current = null;
        speculativePromiseRef.current = null;
    };

    const handleExtractionComplete = (result: ExtractionResult | null, text?: string) => {
        setLoading(false);
        if (result && text) {
            setExtractionData(result);
            setContractText(text);

            // Start speculative analysis in background while user selects conditions
            console.log("[Speculative] Starting background analysis...");
            speculativePromiseRef.current = startSpeculativeAnalysis(text, analyzeDeepAction);

            // Show condition selection form (speculative analysis runs in parallel)
            setStep("unified_context");
        }
    };

    // Save analysis to history (DISABLED for No-Auth Phase)
    const handleSaveToHistory = useCallback(async (data: EnhancedAnalysisResult, text: string, type?: string) => {
        // Auth removed, skipping persistent history save for now.
        // Future: Save to localStorage or similar.
    }, []);

    // NEW: Auto-analysis handler with overlay (no page transition)
    // This provides faster UX by eliminating the unified_context step
    const handleAutoAnalysis = async (
        text: string,
        extraction: ExtractionResult,
        ctx: UserContext,
        role: "party_a" | "party_b"
    ) => {
        trackEvent(ANALYTICS_EVENTS.USER_CONTEXT_COMPLETED);
        trackEvent(ANALYTICS_EVENTS.ROLE_SELECTED, { role });

        // Show overlay instead of changing step
        setIsAnalyzing(true);

        try {
            let result: AnalysisState;

            // Wait for speculative analysis if still running
            if (speculativePromiseRef.current) {
                console.log("[Speculative] Waiting for background analysis...");
                const cache = await speculativePromiseRef.current;
                if (cache) {
                    speculativeCacheRef.current = cache;
                }
            }

            const cache = speculativeCacheRef.current;

            if (cache && isContextMatch(ctx, cache.usedContext)) {
                // FAST PATH: Use cached results immediately
                console.log("[Speculative] Context matches! Using cached results (INSTANT)");
                setAnalysisData(cache.analysisResult);
                // Calculate score for ScoreReveal
                const criticalCount = cache.analysisResult.risks.filter(r => r.risk_level === "critical").length;
                const highCount = cache.analysisResult.risks.filter(r => r.risk_level === "high").length;
                const score = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10));
                const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
                const topRisks = cache.analysisResult.risks
                    .filter(r => r.risk_level === "critical" || r.risk_level === "high")
                    .slice(0, 3)
                    .map(r => ({ title: r.section_title, description: r.explanation, level: r.risk_level as "critical" | "high" | "medium" }));
                setScoreData({ score, grade, topRisks });
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED, { speculative: true });
                setIsAnalyzing(false);
                setStep("score_reveal");

                try {
                    localStorage.setItem("agreeLastAnalysis", JSON.stringify({
                        timestamp: new Date().toISOString(),
                        data: cache.analysisResult,
                        text: text,
                    }));
                } catch { }
                return;
            }

            // Full analysis with actual context
            console.log("[Analysis] Running full analysis...");
            result = await analyzeDeepAction(text, ctx);

            if (result.data) {
                setAnalysisData(result.data);
                // Calculate score for ScoreReveal
                const criticalCount = result.data.risks.filter(r => r.risk_level === "critical").length;
                const highCount = result.data.risks.filter(r => r.risk_level === "high").length;
                const score = Math.max(0, 100 - (criticalCount * 20) - (highCount * 10));
                const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
                const topRisks = result.data.risks
                    .filter(r => r.risk_level === "critical" || r.risk_level === "high")
                    .slice(0, 3)
                    .map(r => ({ title: r.section_title, description: r.explanation, level: r.risk_level as "critical" | "high" | "medium" }));
                setScoreData({ score, grade, topRisks });
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED);
                setIsAnalyzing(false);
                setStep("score_reveal");

                try {
                    localStorage.setItem("agreeLastAnalysis", JSON.stringify({
                        timestamp: new Date().toISOString(),
                        data: result.data,
                        text: text,
                    }));
                } catch { }
            } else {
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "analysis_failed" });
                alert("分析中にエラーが発生しました。もう一度お試しください！");
                setIsAnalyzing(false);
                setStep("upload");
            }
        } catch (e) {
            console.error(e);
            trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "exception" });
            alert("エラーが発生しました。もう一度お試しください！");
            setIsAnalyzing(false);
            setStep("upload");
        }
    };

    // Cancel analysis handler
    const handleCancelAnalysis = () => {
        setIsAnalyzing(false);
        setStep("upload");
        setExtractionData(null);
        setContractText("");
        speculativeCacheRef.current = null;
        speculativePromiseRef.current = null;
    };

    // Load history item
    const handleSelectHistory = async (historyId: string) => {
        // Disabled for Auth Removal Phase
        /*
        const data = await loadFromHistory(historyId);
        if (data) {
            setContractText(data.contractText);
            setAnalysisData(data.analysisResult);
            setExtractionData({
                party_a: "",
                party_b: "",
                contract_type: data.contractType || "",
                estimated_contract_months: 12,
                client_party: "unknown"
            });
            setCurrentHistoryId(historyId);
            setStep("complete");
            setSidebarOpen(false);
        }
        */
    };

    // New analysis from sidebar
    const handleNewAnalysis = () => {
        handleAnalysisStart();
        setSidebarOpen(false);
    };
    // Handler for when user completes context selection
    const handleContextComplete = (ctx: UserContext, role: "party_a" | "party_b") => {
        // Merge role into context
        const contextWithRole = { ...ctx, contractRole: role };
        handleAutoAnalysis(contractText, extractionData!, contextWithRole, role);
    };

    // Initially show the unified hero with upload section
    if (step === "upload" && !analysisData) {
        return (
            <div className="min-h-screen flex flex-col bg-guardian-warm bg-guardian-blob text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
                {/* History Sidebar - visible for all users */}
                <HistorySidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onSelectHistory={handleSelectHistory}
                    onNewAnalysis={handleNewAnalysis}
                    currentHistoryId={currentHistoryId}
                />

                {/* Usage limit banner - REMOVED */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}>

                    <section className="flex-1 flex flex-col items-center pt-32 pb-16 px-6 max-w-2xl mx-auto w-full transition-all duration-500">
                        {/* Minimalist Logo - Optimized size/aspect for new branding */}
                        <div className="mb-14 flex flex-col items-center">
                            <SignatureLogo className="w-56" />
                        </div>

                        {/* Main Copy - Guardian Manager voice */}
                        <div className="text-center space-y-5 mb-14 animate-fade-in-delayed">
                            <p className="text-2xl leading-normal max-w-lg mx-auto font-bold text-primary text-balance tracking-tight">
                                契約書のリスクを高速チェック！<br />
                                安心して契約を結べるようサポートします。
                            </p>
                            <p className="text-slate-600 text-[15px] leading-relaxed max-w-md mx-auto font-medium">
                                専門用語の解説から修正案まで、<br />
                                AIがバシッと分かりやすくお伝えします！
                            </p>
                        </div>

                        {/* Unified Upload Section */}
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <UploadSection
                                onAnalysisStart={handleAnalysisStart}
                                onAnalysisComplete={handleExtractionComplete}
                            />
                        </div>

                        {/* Link to how-to-use */}
                        <div className="mt-10">
                            <Link href="/how-to-use" className="inline-block text-sm text-slate-400 hover:text-slate-600 border-b border-dashed border-slate-300 pb-0.5 transition-colors">
                                agreeの使い方を確認する
                            </Link>
                        </div>
                    </section>

                    <Footer />
                </div>

                {/* Analyzing Overlay - shows step-by-step progress */}
                <AnalyzingOverlay isActive={isAnalyzing} onCancel={handleCancelAnalysis} />
            </div>
        );
    }

    // Context selection step (speculative analysis running in background)
    if (step === "unified_context" && extractionData) {
        return (
            <div className="min-h-screen flex flex-col bg-guardian-warm bg-guardian-blob text-slate-600 font-sans">
                {/* Analyzing Overlay - shows step-by-step progress */}
                <AnalyzingOverlay isActive={isAnalyzing} onCancel={handleCancelAnalysis} />

                {/* Header */}
                <header className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            setStep("upload");
                            setExtractionData(null);
                            setContractText("");
                            speculativeCacheRef.current = null;
                            speculativePromiseRef.current = null;
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="agree" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                </header>

                {/* Main Content */}
                <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16">
                    <div className="text-center mb-8">
                        <p className="text-lg text-primary font-medium">
                            確認内容の設定
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            より正確なチェックのためにお答えください
                        </p>
                    </div>

                    <UnifiedContextForm
                        extractionData={extractionData}
                        onComplete={handleContextComplete}
                    />
                </section>

                <Footer />
            </div>
        );
    }

    // Score Reveal step - shows score animation before detailed results
    if (step === "score_reveal" && scoreData && analysisData) {
        return (
            <ScoreReveal
                score={scoreData.score}
                grade={scoreData.grade}
                risks={scoreData.topRisks}
                onContinue={() => setStep("complete")}
            />
        );
    }

    // Analysis Result View (Clean & Centered)
    return (
        <main className="min-h-screen flex flex-col bg-white">
            {/* History Sidebar - visible for all users */}
            <HistorySidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onSelectHistory={handleSelectHistory}
                onNewAnalysis={handleNewAnalysis}
                currentHistoryId={currentHistoryId}
            />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}>
                <header className="h-20 px-8 flex items-center gap-8 max-w-5xl mx-auto w-full">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                            setAnalysisData(null);
                            setStep("upload");
                            setCurrentHistoryId(undefined);
                            // Clear speculative cache
                            speculativeCacheRef.current = null;
                            speculativePromiseRef.current = null;
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="agree" className="h-16 w-auto" />
                    </div>
                    <div className="flex items-center gap-3">
                        {analysisData && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setAnalysisData(null);
                                    setStep("upload");
                                    setCurrentHistoryId(undefined);
                                }}
                                className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full font-normal"
                            >
                                別の契約書をチェックする
                            </Button>
                        )}
                        {/* Login button moved to footer/actions in viewer for better flow */}
                    </div>
                </header>

                <div className={`flex-1 max-w-6xl mx-auto w-full px-8 pb-20`}>
                    {step === "complete" && analysisData ? (
                        <div className="h-[calc(100vh-5rem)] -mx-8">
                            <CorrectedContractReader
                                originalText={contractText}
                                correctedText={generateCorrectedText(contractText, analysisData, rejectedRiskIds)}
                                diffs={generateDiffsFromAnalysis(analysisData, contractText, rejectedRiskIds)}
                                score={scoreData ? calculateCurrentScore(scoreData.score, analysisData.risks.length, rejectedRiskIds.size) : 0}
                                onApplyDiff={(diff) => {
                                    // Already applied by default. Ensure it's not in rejected list
                                    const next = new Set(rejectedRiskIds);
                                    next.delete(diff.originalText);
                                    setRejectedRiskIds(next);
                                }}
                                onSkipDiff={(diff) => {
                                    // User wants to keep original (reject the fix)
                                    const next = new Set(rejectedRiskIds);
                                    next.add(diff.originalText);
                                    setRejectedRiskIds(next);
                                }}
                                onCopy={() => trackEvent(ANALYTICS_EVENTS.SUGGESTION_COPIED)}
                            />
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-4" />
                            <p className="text-slate-400">結果を読み込んでいます...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DEBUG: Quick Load Button for UI Verification */}
            {process.env.NODE_ENV === "development" && !analysisData && step === "upload" && (
                <div className="fixed bottom-4 left-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs"
                        onClick={async () => {
                            const { SAMPLE_ANALYSIS_RESULT, SAMPLE_CONTRACT_TEXT } = await import("@/lib/debug-data");
                            setContractText(SAMPLE_CONTRACT_TEXT);
                            setAnalysisData(SAMPLE_ANALYSIS_RESULT);
                            setExtractionData({
                                party_a: "株式会社グッドカンパニー",
                                party_b: "田中花子",
                                contract_type: "業務委託基本契約書",
                                estimated_contract_months: 12,
                                client_party: "party_a"
                            });
                            setStep("complete");
                        }}
                    >
                        🐛 Debug: Load Sample
                    </Button>
                </div>
            )}
        </main>
    );
}
