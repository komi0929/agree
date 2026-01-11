"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Send, FileText, X, Check } from "lucide-react";

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
            <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300 border border-primary/20">
                {/* Header */}
                <div className="bg-primary/5 p-6 text-center relative border-b border-primary/10">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-primary">確認が完了しました</h2>
                    <p className="text-sm text-muted-foreground mt-1">次のステップを選んでください</p>
                </div>

                {/* Options */}
                <div className="p-6 space-y-3">
                    <button
                        onClick={() => handleAction("view")}
                        className="w-full p-4 rounded-xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-4 group bg-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                            <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-primary">結果を確認する</p>
                            <p className="text-xs text-muted-foreground">まずは内容を見てみる</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction("message")}
                        className="w-full p-4 rounded-xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-4 group bg-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                            <Send className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-primary">相手に伝える</p>
                            <p className="text-xs text-muted-foreground">修正依頼メッセージを作成</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleAction("contract")}
                        className="w-full p-4 rounded-xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-4 group bg-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/5 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-primary">修正契約書を作る</p>
                            <p className="text-xs text-muted-foreground">AIが修正版を自動生成</p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="w-full text-muted-foreground hover:text-primary rounded-full hover:bg-primary/5"
                    >
                        まずは結果を見てみる
                    </Button>
                </div>
            </div>
        </div>
    );
}
