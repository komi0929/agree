"use client";

import { AlertCircle, X, Sparkles } from "lucide-react";
import { useUsageLimit } from "@/hooks/use-usage-limit";
import { useState } from "react";

interface UsageLimitBannerProps {
    onRegisterClick?: () => void;
    type?: "check" | "generation";
}

/**
 * Banner showing remaining usage count
 * Displayed when user has limited remaining or reached limit
 */
export function UsageLimitBanner({ onRegisterClick, type = "check" }: UsageLimitBannerProps) {
    const {
        plan,
        checkRemaining,
        checkLimit,
        hasReachedCheckLimit,
        generationRemaining,
        generationLimit,
        hasReachedGenerationLimit,
        isLoading,
        isRegistered,
    } = useUsageLimit();
    const [isDismissed, setIsDismissed] = useState(false);

    if (isLoading || isDismissed) return null;

    // Check type banner
    if (type === "check") {
        // Show when remaining is 2 or less, or reached limit
        if (checkRemaining > 2 && !hasReachedCheckLimit) return null;

        if (hasReachedCheckLimit) {
            return (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-900">
                                    今月の無料チェック回数を使い切りました
                                </p>
                                <p className="text-xs text-amber-700">
                                    {!isRegistered
                                        ? "無料登録すると月10回までチェックできます"
                                        : "来月までお待ちください"}
                                </p>
                            </div>
                        </div>
                        {!isRegistered && onRegisterClick && (
                            <button
                                onClick={onRegisterClick}
                                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-colors flex-shrink-0"
                            >
                                無料登録する
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>
                            今月のチェック: <span className="font-bold text-slate-900">残り{checkRemaining}回</span>
                            <span className="text-slate-400 ml-1">/ {checkLimit}回</span>
                        </span>
                        {!isRegistered && (
                            <button
                                onClick={onRegisterClick}
                                className="text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-2"
                            >
                                登録で月10回に増やす
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Generation type banner (only for registered users)
    if (type === "generation" && isRegistered) {
        if (generationRemaining > 2 && !hasReachedGenerationLimit) return null;

        if (hasReachedGenerationLimit) {
            return (
                <div className="bg-purple-50 border-b border-purple-200 px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-purple-900">
                                    今月のAI生成回数を使い切りました
                                </p>
                                <p className="text-xs text-purple-700">
                                    来月までお待ちください
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-purple-50/50 border-b border-purple-100 px-4 py-2">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>
                            AI生成: <span className="font-bold text-slate-900">残り{generationRemaining}回</span>
                            <span className="text-slate-400 ml-1">/ {generationLimit}回</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
