"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, FileText, Download, Headphones, Zap } from "lucide-react";

type ProGateReason = "modify" | "export" | "unlimited";

interface ProUpgradeModalProps {
    open: boolean;
    onClose: () => void;
    reason: ProGateReason;
}

const REASON_MESSAGES: Record<ProGateReason, { title: string; description: string }> = {
    modify: {
        title: "AIによる自動修正はPro限定機能です",
        description: "選択したリスクを自動で修正した契約書を生成できます。",
    },
    export: {
        title: "PDFエクスポートはPro限定機能です",
        description: "生成した契約書をPDFでダウンロードできます。",
    },
    unlimited: {
        title: "月5回の上限に達しました",
        description: "Proプランなら無制限でチェックできます。",
    },
};

const PRO_FEATURES = [
    { icon: Zap, text: "無制限の契約書チェック", highlight: true },
    { icon: Sparkles, text: "AIによる自動修正反映" },
    { icon: Download, text: "PDFエクスポート" },
    { icon: Headphones, text: "優先サポート" },
];

export function ProUpgradeModal({ open, onClose, reason }: ProUpgradeModalProps) {
    const { title, description } = REASON_MESSAGES[reason];

    const handleUpgrade = () => {
        // TODO: Implement Stripe checkout
        // For now, just show a message
        alert("課金機能は準備中です。近日公開予定！");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-background border border-primary/20 sm:rounded-2xl">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-primary">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Pro Features */}
                    <div className="bg-primary/5 rounded-2xl p-5 space-y-4 border border-primary/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-primary">Pro プラン</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-primary">¥980</span>
                                <span className="text-sm text-muted-foreground">/ 月</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {PRO_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${feature.highlight
                                        ? "bg-primary/20"
                                        : "bg-white border border-primary/10"
                                        }`}>
                                        <feature.icon className={`w-3.5 h-3.5 ${feature.highlight
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <span className={`text-sm ${feature.highlight
                                        ? "font-medium text-primary"
                                        : "text-muted-foreground"
                                        }`}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-full hover:text-[#FFD700]"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Proにアップグレード
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            いつでもキャンセル可能
                        </p>
                    </div>

                    {/* Later option */}
                    <button
                        onClick={onClose}
                        className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        今はスキップ
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
