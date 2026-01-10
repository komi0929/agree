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
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-slate-900">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Pro Features */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 space-y-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">Pro プラン</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-slate-900">¥980</span>
                                <span className="text-sm text-slate-500">/ 月</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {PRO_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${feature.highlight
                                            ? "bg-blue-100"
                                            : "bg-slate-100"
                                        }`}>
                                        <feature.icon className={`w-3.5 h-3.5 ${feature.highlight
                                                ? "text-blue-600"
                                                : "text-slate-600"
                                            }`} />
                                    </div>
                                    <span className={`text-sm ${feature.highlight
                                            ? "font-medium text-slate-900"
                                            : "text-slate-700"
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
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Proにアップグレード
                        </Button>
                        <p className="text-center text-xs text-slate-400">
                            いつでもキャンセル可能
                        </p>
                    </div>

                    {/* Later option */}
                    <button
                        onClick={onClose}
                        className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        今はスキップ
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
