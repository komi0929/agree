"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

interface GuideBarProps {
    onDismiss?: () => void;
}

export function GuideBar({ onDismiss }: GuideBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has dismissed the guide before
        try {
            const dismissed = localStorage.getItem("agreeGuideBarDismissed");
            if (!dismissed) {
                setIsVisible(true);
            }
        } catch {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        try {
            localStorage.setItem("agreeGuideBarDismissed", "true");
        } catch {
            // Ignore storage errors
        }
        onDismiss?.();
    };

    if (!isVisible) return null;

    return (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 animate-in slide-in-from-top-2 duration-300">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-blue-800">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-sm">
                        <span className="font-medium">ヒント:</span>
                        {" "}
                        気になるリスクは「この修正を選択」→ 下の「修正依頼の文章作成」で相手に伝える文章を作れます
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-100"
                    aria-label="ガイドを非表示"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
