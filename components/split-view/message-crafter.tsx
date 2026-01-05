"use client";

import { useState, useEffect } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface MessageCrafterProps {
    risk: EnhancedAnalysisResult["risks"][0] | null;
    selectedRisks?: EnhancedAnalysisResult["risks"];
    onFinish: () => void;
}

export function MessageCrafter({ risk, selectedRisks, onFinish }: MessageCrafterProps) {
    const [tone, setTone] = useState<"formal" | "neutral" | "casual">("neutral");
    const [copied, setCopied] = useState(false);
    const [showFinish, setShowFinish] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState("");

    const isMultiple = selectedRisks && selectedRisks.length > 0;

    useEffect(() => {
        if (isMultiple && selectedRisks) {
            // Generate combined message
            const preamble = {
                formal: "お世話になっております。\n契約書の内容を確認いたしました。\n以下の点について、修正をお願いしたく存じます。\n\n",
                neutral: "お疲れ様です。\n契約書を確認しました。\n以下の箇所について修正をお願いできますでしょうか。\n\n",
                casual: "契約書見ました！\nちょっと以下の点だけ気になったので、相談させてください。\n\n"
            };

            const closing = {
                formal: "\n\nお手数をおかけしますが、ご検討のほどよろしくお願いいたします。",
                neutral: "\n\nご確認よろしくお願いいたします。",
                casual: "\n\nよろしくお願いします！"
            };

            const points = selectedRisks.map((r, i) => {
                const suggestion = r.suggestion.revised_text || "（修正内容を記載）";
                return `${i + 1}. ${r.section_title}\n   要望: ${suggestion}`;
            }).join("\n\n");

            setGeneratedMessage(`${preamble[tone]}${points}${closing[tone]}`);

        } else if (risk) {
            // Use pre-calculated message from AI if available, or fallback
            // Note: The AI result structure assumes `negotiation_message` exists.
            setGeneratedMessage(risk.suggestion.negotiation_message[tone]);
        }
    }, [risk, selectedRisks, tone, isMultiple]);

    if (!risk && !isMultiple) return <div className="p-8 text-center text-slate-400">項目を選択してください</div>;

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setShowFinish(true); // Show finish button after copy
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                    {isMultiple ? `${selectedRisks?.length}項目の修正依頼メッセージ` : "相手へのメッセージ案"}
                </h3>
                <p className="text-slate-500 text-sm">
                    {isMultiple
                        ? "選択した複数の修正点を含むメッセージを作成しました。"
                        : "修正依頼を送るためのメッセージを作成しました。"}
                    <br />
                    相手との関係性に合わせてトーンを選んでください。
                </p>
            </div>

            <div className="flex-1 flex flex-col space-y-4">
                <Tabs value={tone} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-full p-1">
                        <TabsTrigger value="formal" disabled className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs opacity-50 cursor-not-allowed">フォーマル (準備中)</TabsTrigger>
                        <TabsTrigger value="neutral" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">標準</TabsTrigger>
                        <TabsTrigger value="casual" disabled className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs opacity-50 cursor-not-allowed">カジュアル (準備中)</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative flex-1">
                    <Textarea
                        value={generatedMessage}
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
