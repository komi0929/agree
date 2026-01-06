"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Send, FileText, X } from "lucide-react";

interface WelcomeModalProps {
    onClose: () => void;
    onSelectAction?: (action: "view" | "message" | "contract") => void;
}

export function WelcomeModal({ onClose, onSelectAction }: WelcomeModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen the welcome modal before
        try {
            const seen = localStorage.getItem("agreeWelcomeModalSeen");
            if (!seen) {
                setIsVisible(true);
            }
        } catch {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        try {
            localStorage.setItem("agreeWelcomeModalSeen", "true");
        } catch {
            // Ignore storage errors
        }
        onClose();
    };

    const handleAction = (action: "view" | "message" | "contract") => {
        handleClose();
        onSelectAction?.(action);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        aria-label="閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-4xl mb-2">✅</div>
                    <h2 className="text-xl font-bold">チェック完了！</h2>
                    <p className="text-sm text-blue-100 mt-1">次のステップを選んでください</p>
                </div>

                {/* Options */}
                <div className="p-6 space-y-3">
                    <button
                        onClick={() => handleAction("view")}
                        className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Eye className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-slate-800">結果を確認する</p>
                            <p className="text-xs text-slate-500">まずは指摘内容を見てみる</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction("message")}
                        className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                            <Send className="w-6 h-6 text-slate-600 group-hover:text-teal-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-slate-800">相手に伝える</p>
                            <p className="text-xs text-slate-500">修正依頼メッセージを作成</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction("contract")}
                        className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                            <FileText className="w-6 h-6 text-slate-600 group-hover:text-purple-600" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-slate-800">修正契約書を作る</p>
                            <p className="text-xs text-slate-500">AIが修正版を自動生成</p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="w-full text-slate-500 hover:text-slate-700"
                    >
                        まずは結果を見てみる
                    </Button>
                </div>
            </div>
        </div>
    );
}
