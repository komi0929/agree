"use client";

import { useState } from "react";
import { EnhancedAnalysisResult } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface MessageCrafterProps {
    risk: EnhancedAnalysisResult["risks"][0] | null;
    onFinish: () => void;
}

export function MessageCrafter({ risk, onFinish }: MessageCrafterProps) {
    const [tone, setTone] = useState<"formal" | "neutral" | "casual">("neutral");
    const [copied, setCopied] = useState(false);
    const [showFinish, setShowFinish] = useState(false);

    if (!risk) return <div className="p-8 text-center text-slate-400">項目を選択してください</div>;

    const message = risk.suggestion.negotiation_message[tone];

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setShowFinish(true); // Show finish button after copy
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">相手へのメッセージ案</h3>
                <p className="text-slate-500 text-sm">
                    修正依頼を送るためのメッセージを作成しました。<br />
                    相手との関係性に合わせてトーンを選んでください。
                </p>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                <Tabs value={tone} onValueChange={(v) => setTone(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-full p-1">
                        <TabsTrigger value="formal" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">フォーマル</TabsTrigger>
                        <TabsTrigger value="neutral" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">標準</TabsTrigger>
                        <TabsTrigger value="casual" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">カジュアル</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative flex-1">
                    <Textarea
                        value={message}
                        readOnly
                        className="h-full min-h-[300px] resize-none p-6 text-base leading-relaxed border-slate-200 focus-visible:ring-slate-300 bg-slate-50/50 rounded-xl mb-16"
                    />

                    <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 w-full px-4">
                        {/* Copy Button */}
                        <Button
                            onClick={handleCopy}
                            className={`w-full md:w-auto rounded-full shadow-lg transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700" : "bg-slate-900 hover:bg-slate-800"}`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    コピーしました
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    コピーして利用する
                                </>
                            )}
                        </Button>

                        {/* Finish Button - Appears after copy */}
                        {showFinish && (
                            <div className="w-full md:w-auto animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <p className="text-[10px] text-slate-400 text-center mb-2">
                                    先方への連絡が済みましたら、終了ボタンを押してください
                                </p>
                                <Button
                                    onClick={onFinish}
                                    variant="secondary"
                                    className="w-full rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm"
                                >
                                    完了して終了する
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
