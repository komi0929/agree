"use client";

import { useState, useRef, useEffect } from "react";
import { UploadSection } from "@/components/upload-section";
import { trackEvent, trackPageView, ANALYTICS_EVENTS } from "@/lib/analytics/client";
import { AnalysisResultPlaceholder } from "@/components/analysis-result-placeholder";
import { AnalysisViewer } from "@/components/analysis-viewer";
import { EnhancedAnalysisResult, ExtractionResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { SignatureLogo } from "@/components/signature-logo";
import { RoleSelector } from "@/components/role-selector";
import { UserContextForm } from "@/components/user-context-form";
import { analyzeDeepAction, AnalysisState } from "@/app/actions";
import { UserContext, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<EnhancedAnalysisResult | null>(null);
  const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null);
  const [contractText, setContractText] = useState<string>("");
  const [userContext, setUserContext] = useState<UserContext>(DEFAULT_USER_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [step, setStep] = useState<"upload" | "user_context" | "role_selection" | "analyzing" | "complete">("upload");

  // Store the promise of the deep analysis so we can await it later
  const deepAnalysisPromiseRef = useRef<Promise<AnalysisState> | null>(null);

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
      // Go to user context collection first
      setStep("user_context");
    }
  };

  const handleUserContextComplete = (ctx: UserContext) => {
    setUserContext(ctx);
    setStep("role_selection");
    // 🚀 START DEEP ANALYSIS IN BACKGROUND with user context!
    deepAnalysisPromiseRef.current = analyzeDeepAction(contractText, ctx);
    trackEvent(ANALYTICS_EVENTS.USER_CONTEXT_COMPLETED);
  };

  const handleRoleSelect = async (role: "party_a" | "party_b") => {
    trackEvent(ANALYTICS_EVENTS.ROLE_SELECTED, { role });
    setStep("analyzing");

    // Await the background analysis that (hopefully) started seconds ago
    if (deepAnalysisPromiseRef.current) {
      try {
        const result = await deepAnalysisPromiseRef.current;
        // 緩和策: dataが存在すれば、successがfalseでも表示する（部分的な解析結果でもユーザーに見せる）
        if (result.data) {
          setAnalysisData(result.data);
          trackEvent(ANALYTICS_EVENTS.ANALYSIS_COMPLETED);
          setStep("complete");
        } else {
          trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "analysis_failed" });
          alert("詳細解析に失敗しました。もう一度お試しください。");
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

  // Initially show the minimalist hero with optional upload reveal
  if (step === "upload" && !analysisData) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
        <section className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 max-w-2xl mx-auto w-full">
          {/* Minimalist Logo with Signature Animation */}
          <div className="mb-12 flex flex-col items-center">
            <SignatureLogo className="w-32 h-16" />
          </div>

          {/* Quiet Introduction */}
          {!hasStarted ? (
            <div className="text-center space-y-12 animate-fade-in-delayed">
              <div className="space-y-8">
                <p className="text-lg leading-loose max-w-lg mx-auto font-medium">
                  お仕事の契約の、はじまりから終わりまで。<br />
                  あなたの立場をそっと、確かに守ります。
                </p>
                <p className="text-lg leading-loose max-w-lg mx-auto text-slate-500">
                  面倒な登録も、煩わしい通知もありません。<br />
                  契約書をアップして、ただ待つだけ。
                </p>
              </div>

              <Button
                onClick={() => {
                  trackEvent(ANALYTICS_EVENTS.STARTED_CLICKED);
                  setHasStarted(true);
                }}
                className="rounded-full px-10 py-7 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all text-lg font-medium tracking-wide"
              >
                契約書をチェックする
              </Button>

              <div className="pt-8">
                <Link href="#" className="text-sm text-slate-400 hover:text-slate-600 border-b border-dashed border-slate-300 pb-0.5 transition-colors">
                  できることを見る
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

  // User Context Collection Step
  if (step === "user_context") {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <UserContextForm onComplete={handleUserContextComplete} />
        </div>
      </div>
    );
  }

  if (step === "role_selection" && extractionData) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <RoleSelector
            extractionData={extractionData}
            onSelectRole={handleRoleSelect}
          />
        </div>
      </div>
    );
  }

  if (step === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6 animate-in fade-in">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-16 w-16 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">詳細なリスクを解析しています...</p>
          <p className="text-slate-400 text-xs">もう間もなく完了します</p>
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
          <img src="/logo.png" alt="agree" className="h-12 w-auto" />
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
            <AnalysisViewer data={analysisData} text={contractText} />
          </div>
        ) : (
          <div className="py-20">
            <AnalysisResultPlaceholder />
          </div>
        )}
      </div>
    </main>
  );
}
