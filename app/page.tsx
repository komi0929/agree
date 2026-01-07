"use client";

import { useState, useRef, useEffect } from "react";
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
import { FileText, Shield, MessageSquare, Loader2 } from "lucide-react";
import { useStreamingAnalysis } from "@/hooks/use-streaming-analysis";
import { StreamingProgress } from "@/components/streaming-progress";
import { useLocalHistory } from "@/hooks/use-local-history";

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

export default function Home() {
  const [analysisData, setAnalysisData] = useState<EnhancedAnalysisResult | null>(null);
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [contractText, setContractText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  // A-1: Simplified flow - only 3 steps now: upload -> unified_context -> analyzing -> complete
  const [step, setStep] = useState<"upload" | "unified_context" | "analyzing" | "complete">("upload");
  // A-2: Progressive loading messages
  const [loadingMessage, setLoadingMessage] = useState("契約書を読み込んでいます...");

  // Store the promise of the deep analysis so we can await it later
  const deepAnalysisPromiseRef = useRef<Promise<AnalysisState> | null>(null);

  // Streaming analysis hook for faster perceived performance
  const streaming = useStreamingAnalysis({
    onComplete: (result) => {
      setAnalysisData(result);
      trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED);
      setStep("complete");
      // Save to localStorage
      try {
        localStorage.setItem("agreeLastAnalysis", JSON.stringify({
          timestamp: new Date().toISOString(),
          data: result,
          text: contractText,
        }));
      } catch { }
    },
    onError: (error) => {
      console.error("Streaming error, falling back to standard API:", error);
      // Fallback to traditional analysis will be handled
    },
  });

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
  };

  const handleExtractionComplete = (result: ExtractionResult | null, text?: string) => {
    setLoading(false);
    if (result && text) {
      setExtractionData(result);
      setContractText(text);
      // A-1: Go directly to unified context (combines user context + role selection)
      setStep("unified_context");
    }
  };

  // A-1: Unified handler for context + role completion
  const handleUnifiedComplete = async (ctx: UserContext, role: "party_a" | "party_b") => {
    trackEvent(ANALYTICS_EVENTS.USER_CONTEXT_COMPLETED);
    trackEvent(ANALYTICS_EVENTS.ROLE_SELECTED, { role });

    setStep("analyzing");

    // Try streaming first for faster perceived performance
    try {
      await streaming.startAnalysis(contractText, ctx.userRole);
      // Success is handled by onComplete callback
    } catch (streamError) {
      console.error("Streaming failed, using fallback:", streamError);

      // Fallback to traditional analysis
      setLoadingMessage("契約書を読み込んでいます...");
      try {
        const result = await analyzeDeepAction(contractText, ctx);
        if (result.data) {
          setAnalysisData(result.data);
          trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED);
          setStep("complete");
          try {
            localStorage.setItem("agreeLastAnalysis", JSON.stringify({
              timestamp: new Date().toISOString(),
              data: result.data,
              text: contractText,
            }));
          } catch { }
        } else {
          trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "analysis_failed" });
          alert("チェックできませんでした。もう一度お試しください。");
          setStep("upload");
        }
      } catch (e) {
        console.error(e);
        trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "exception" });
        alert("エラーが発生しました");
        setStep("upload");
      }
    }
  };

  // A-1: Quick start handler (skip detailed settings)
  const handleQuickStart = async () => {
    if (!extractionData) return;

    // Use defaults
    const defaultContext: UserContext = {
      ...DEFAULT_USER_CONTEXT,
      userRole: "vendor",
      userEntityType: "individual",
      counterpartyCapital: "unknown",
    };

    // Default to party_b (most freelancers are 乙)
    await handleUnifiedComplete(defaultContext, "party_b");
  };

  // Initially show the minimalist hero with optional upload reveal
  if (step === "upload" && !analysisData) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
        <section className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 max-w-2xl mx-auto w-full">
          {/* Minimalist Logo with Signature Animation */}
          <div className="mb-20 flex flex-col items-center">
            {/* Logo matches text color exactly (black) */}
            <SignatureLogo className="w-64 h-32 text-black" />
          </div>

          {/* Quiet Introduction */}
          {!hasStarted ? (
            <div className="text-center space-y-12 animate-fade-in-delayed">
              <div className="space-y-8">
                <p className="text-lg leading-loose max-w-lg mx-auto font-medium text-black text-balance tracking-wide">
                  契約書、ちょっと不安じゃないですか？<br />
                  難しいことは、AIにおまかせ。
                </p>
                <p className="text-lg leading-loose max-w-lg mx-auto font-medium text-black text-balance tracking-wide">
                  登録も通知もいりません。<br />
                  契約書をアップして、ちょっと待つだけ。
                </p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Button
                  onClick={() => {
                    trackEvent(ANALYTICS_EVENTS.STARTED_CLICKED);
                    setHasStarted(true);
                  }}
                  className="relative rounded-full px-12 py-8 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-medium tracking-wide overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10">さっそく見てもらう</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                </Button>
              </div>

              {/* Link to why we made this */}
              <div className="pt-8">
                <Link href="/how-to-use" className="inline-block text-sm text-slate-400 hover:text-slate-600 border-b border-dashed border-slate-300 pb-0.5 transition-colors">
                  agreeについて
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <UploadSection
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleExtractionComplete}
              />
              <div className="mt-12 text-center">
                <button
                  onClick={() => setHasStarted(false)}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  戻る
                </button>
              </div>
            </div>
          )
          }
        </section >

        <Footer />
      </div >
    );
  }

  // A-1: Unified Context Collection Step (combines user context + role selection)
  if (step === "unified_context" && extractionData) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <div className="flex-1 flex flex-col items-center justify-start py-8 px-4 overflow-y-auto">
          <UnifiedContextForm
            extractionData={extractionData}
            onComplete={handleUnifiedComplete}
            onSkip={handleQuickStart}
          />
        </div>
      </div>
    );
  }

  // A-2: Progressive loading screen with streaming progress
  if (step === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 animate-in fade-in">
        <div className="w-full max-w-md">
          <StreamingProgress
            state={streaming.state}
            progress={streaming.progress}
            elapsedTime={streaming.elapsedTime}
            rawContent={streaming.rawContent}
          />

          {/* Fallback display when streaming is idle (using traditional analysis) */}
          {streaming.state === "idle" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 border-2 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-slate-800 font-medium">{loadingMessage}</p>
                  <p className="text-slate-400 text-sm">しばらくお待ちください...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Analysis Result View (Clean & Centered)
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <header className="h-20 px-8 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAnalysisData(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="agree" className="h-16 w-auto" />
        </div>
        {analysisData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAnalysisData(null);
              setStep("upload");
              setHasStarted(true);
            }}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-full font-normal"
          >
            新しくチェックする
          </Button>
        )}
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-8 pb-20">
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
    </main>
  );
}
