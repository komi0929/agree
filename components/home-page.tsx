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
import { useAuth } from "@/lib/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { HistorySidebar, useAnalysisHistory } from "@/components/history-sidebar";
import { UsageLimitBanner } from "@/components/ui/usage-limit-banner";
import { RegistrationGateModal } from "@/components/auth/registration-gate-modal";

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
                    <span className="text-slate-500">結果を表示中...</span>
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

export function HomePage() {
    const [analysisData, setAnalysisData] = useState<EnhancedAnalysisResult | null>(null);
    const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
    const [contractText, setContractText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    // Full flow: upload -> unified_context -> complete (analyzing happens via overlay)
    const [step, setStep] = useState<"upload" | "unified_context" | "complete">("upload");
    // Overlay state for analyzing
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    // Progressive loading messages
    const [loadingMessage, setLoadingMessage] = useState("契約書を解析しています...");

    // Auth & History state
    const { user, isLoading: authLoading } = useAuth();
    const { saveToHistory, loadFromHistory } = useAnalysisHistory();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showGateModal, setShowGateModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();
    const [showSavePrompt, setShowSavePrompt] = useState(false);

    // Store the promise of the deep analysis so we can await it later
    const deepAnalysisPromiseRef = useRef<Promise<AnalysisState> | null>(null);

    // SPECULATIVE EXECUTION: Cache for pre-computed analysis
    const speculativeCacheRef = useRef<SpeculativeAnalysisCache | null>(null);
    const speculativePromiseRef = useRef<Promise<SpeculativeAnalysisCache | null> | null>(null);

    // Track page view on mount
    useEffect(() => {
        trackPageView();
    }, []);

    // Auto-open sidebar for logged-in users
    useEffect(() => {
        if (user && !authLoading) {
            setSidebarOpen(true);
        }
    }, [user, authLoading]);

    const handleAnalysisStart = () => {
        setLoading(true);
        setAnalysisData(null);
        setExtractionData(null);
        setContractText("");
        setStep("upload");
        setCurrentHistoryId(undefined);
        setShowSavePrompt(false);
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

    // Save analysis to history (for logged-in users)
    const handleSaveToHistory = useCallback(async (data: EnhancedAnalysisResult, text: string, type?: string) => {
        if (!user) return;

        // Generate title from contract type or first 30 chars of text
        const title = type || text.slice(0, 30).replace(/\s+/g, " ").trim() + "...";
        const historyId = await saveToHistory(title, text, data, type);
        if (historyId) {
            setCurrentHistoryId(historyId);
        }
    }, [user, saveToHistory]);

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
        setLoadingMessage("契約書を拝見しています...");

        // Progressive loading messages
        const messages = [
            "内容を確認しています...",
            "条項をチェックしています...",
            "重要なポイントを整理しています...",
            "まもなく完了します..."
        ];
        let msgIndex = 0;
        const interval = setInterval(() => {
            msgIndex = Math.min(msgIndex + 1, messages.length - 1);
            setLoadingMessage(messages[msgIndex]);
        }, 2000);

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
                clearInterval(interval);
                setAnalysisData(cache.analysisResult);
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED, { speculative: true });
                setIsAnalyzing(false);
                setStep("complete");

                // Save to history
                if (user) {
                    await handleSaveToHistory(cache.analysisResult, text, extraction.contract_type);
                } else {
                    setShowSavePrompt(true);
                }

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
            clearInterval(interval);

            if (result.data) {
                setAnalysisData(result.data);
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED);
                setIsAnalyzing(false);
                setStep("complete");

                if (user) {
                    await handleSaveToHistory(result.data, text, extraction.contract_type);
                } else {
                    setShowSavePrompt(true);
                }

                try {
                    localStorage.setItem("agreeLastAnalysis", JSON.stringify({
                        timestamp: new Date().toISOString(),
                        data: result.data,
                        text: text,
                    }));
                } catch { }
            } else {
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "analysis_failed" });
                alert("分析中にエラーが発生しました。もう一度お試しください。");
                setIsAnalyzing(false);
                setStep("upload");
            }
        } catch (e) {
            clearInterval(interval);
            console.error(e);
            trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "exception" });
            alert("エラーが発生しました");
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
        const data = await loadFromHistory(historyId);
        if (data) {
            setContractText(data.contractText);
            setAnalysisData(data.analysisResult);
            setExtractionData({
                party_a: "",
                party_b: "",
                contract_type: data.contractType || "",
                estimated_contract_months: 12
            });
            setCurrentHistoryId(historyId);
            setStep("complete");
            setSidebarOpen(false);
        }
    };

    // New analysis from sidebar
    const handleNewAnalysis = () => {
        handleAnalysisStart();
        setSidebarOpen(false);
    };
    // Handler for when user completes context selection
    const handleContextComplete = (ctx: UserContext, role: "party_a" | "party_b") => {
        handleAutoAnalysis(contractText, extractionData!, ctx, role);
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
                    onLoginClick={() => setShowAuthModal(true)}
                />

                {/* Usage limit banner */}
                <UsageLimitBanner type="check" onRegisterClick={() => setShowGateModal(true)} />

                <section className="flex-1 flex flex-col items-center pt-32 pb-16 px-6 max-w-2xl mx-auto w-full transition-all duration-500">
                    {/* Minimalist Logo - Optimized size/aspect for new branding */}
                    <div className="mb-14 flex flex-col items-center">
                        <SignatureLogo className="w-56" />
                    </div>

                    {/* Main Copy - Guardian Manager voice */}
                    <div className="text-center space-y-5 mb-14 animate-fade-in-delayed">
                        <p className="text-2xl leading-normal max-w-lg mx-auto font-bold text-primary text-balance tracking-tight">
                            契約書のチェックはお任せください。<br />
                            あなたは、創作に集中できます。
                        </p>
                        <p className="text-slate-600 text-[15px] leading-relaxed max-w-md mx-auto font-medium">
                            複雑な契約書も、重要なポイントを分かりやすくお伝えします。<br />
                            安心してお仕事に取り組めるよう、しっかりサポートいたします。
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

                {/* Auth Modal */}
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

                {/* Registration Gate Modal */}
                <RegistrationGateModal
                    open={showGateModal}
                    onClose={() => setShowGateModal(false)}
                    reason="limit"
                />
                {/* Analyzing Overlay - shows on top without page transition */}
                <AnalyzingOverlay
                    isActive={isAnalyzing}
                    loadingMessage={loadingMessage}
                    onCancel={handleCancelAnalysis}
                />
            </div>
        );
    }

    // Context selection step (speculative analysis running in background)
    if (step === "unified_context" && extractionData) {
        return (
            <div className="min-h-screen flex flex-col bg-guardian-warm bg-guardian-blob text-slate-600 font-sans">
                {/* Analyzing Overlay - shows when analysis completes */}
                <AnalyzingOverlay
                    isActive={isAnalyzing}
                    loadingMessage={loadingMessage}
                    onCancel={handleCancelAnalysis}
                />

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
                onLoginClick={() => setShowAuthModal(true)}
            />

            <header className="h-20 px-8 flex items-center justify-between max-w-5xl mx-auto w-full">
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
                            別の契約書を確認する
                        </Button>
                    )}
                    {authLoading ? null : !user && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAuthModal(true)}
                            className="text-slate-500 hover:text-slate-900 rounded-full"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            ログイン
                        </Button>
                    )}
                </div>
            </header>

            <div className={`flex-1 max-w-6xl mx-auto w-full px-8 pb-20 transition-all duration-300`}>
                {step === "complete" && analysisData ? (
                    <div className="h-[calc(100vh-5rem)] -mx-8 bg-slate-50">
                        <AnalysisViewer data={analysisData} text={contractText} contractType={extractionData?.contract_type} />
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-4" />
                        <p className="text-slate-400">結果を読み込んでいます...</p>
                    </div>
                )}
            </div>

            {/* Save prompt for non-logged-in users */}
            {showSavePrompt && !user && step === "complete" && (
                <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 max-w-sm animate-in slide-in-from-bottom-4 z-50">
                    <p className="text-sm text-slate-700 mb-3">
                        診断結果を保存しませんか？<br />
                        <span className="text-slate-500">登録すると履歴がいつでも確認できます。</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => setShowAuthModal(true)}
                            className="flex-1 bg-slate-900 hover:bg-slate-800"
                        >
                            無料で登録
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSavePrompt(false)}
                            className="text-slate-500"
                        >
                            後で
                        </Button>
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

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
                                estimated_contract_months: 12
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
