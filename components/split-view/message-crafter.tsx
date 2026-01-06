"use client";

import { useState, useEffect } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw } from "lucide-react";

interface MessageCrafterProps {
    risk: EnhancedAnalysisResult["risks"][0] | null;
    selectedRisks?: EnhancedAnalysisResult["risks"];
    onFinish: () => void;
}

type MessageTone = "formal" | "neutral" | "casual";
type MessagePurpose = "request" | "question" | "negotiate";

const TONE_OPTIONS = [
    { value: "formal" as const, label: "丁寧に", emoji: "🙏", description: "敬語で丁重に依頼" },
    { value: "neutral" as const, label: "対等に", emoji: "🤝", description: "ビジネスライクに" },
    { value: "casual" as const, label: "カジュアル", emoji: "💬", description: "フレンドリーに" },
];

const PURPOSE_OPTIONS = [
    { value: "request" as const, label: "修正をお願い", emoji: "✏️" },
    { value: "question" as const, label: "質問する", emoji: "❓" },
    { value: "negotiate" as const, label: "条件交渉", emoji: "🤝" },
];

export function MessageCrafter({ risk, selectedRisks, onFinish }: MessageCrafterProps) {
    const [tone, setTone] = useState<MessageTone>("neutral");
    const [purpose, setPurpose] = useState<MessagePurpose>("request");
    const [copied, setCopied] = useState(false);
    const [showFinish, setShowFinish] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const isMultiple = selectedRisks && selectedRisks.length > 0;

    const generateMessage = () => {
        const preamble = {
            formal: {
                request: "お世話になっております。\n契約書の内容を確認いたしました。\n以下の点について、修正をお願いしたく存じます。\n\n",
                question: "お世話になっております。\n契約書を拝見いたしました。\n以下の点についてご確認させていただきたくご連絡いたしました。\n\n",
                negotiate: "お世話になっております。\n契約書を確認いたしました。\n以下の点について、条件のご相談をさせていただけますでしょうか。\n\n",
            },
            neutral: {
                request: "お疲れ様です。\n契約書を確認しました。\n以下の箇所について修正をお願いできますでしょうか。\n\n",
                question: "お疲れ様です。\n契約書を確認しました。\n以下の点について質問があります。\n\n",
                negotiate: "お疲れ様です。\n契約書を確認しました。\n以下の条件について相談させてください。\n\n",
            },
            casual: {
                request: "契約書見ました！\nちょっと以下の点だけ気になったので、相談させてください。\n\n",
                question: "契約書見ました！\n以下の点がちょっと分からなくて、教えてほしいです。\n\n",
                negotiate: "契約書見ました！\n以下の条件についてちょっと相談したいのですが…\n\n",
            },
        };

        const closing = {
            formal: {
                request: "\n\nお手数をおかけしますが、ご検討のほどよろしくお願いいたします。",
                question: "\n\nお忙しいところ恐れ入りますが、ご回答いただけますと幸いです。",
                negotiate: "\n\nご多用中恐縮ですが、ご検討いただけますと幸いです。",
            },
            neutral: {
                request: "\n\nご確認よろしくお願いいたします。",
                question: "\n\nご回答よろしくお願いします。",
                negotiate: "\n\nご検討よろしくお願いします。",
            },
            casual: {
                request: "\n\nよろしくお願いします！",
                question: "\n\nよろしくお願いします！",
                negotiate: "\n\nよろしくお願いします！",
            },
        };

        if (isMultiple && selectedRisks) {
            const points = selectedRisks.map((r, i) => {
                const suggestion = r.suggestion.revised_text || "（修正内容を記載）";
                if (purpose === "question") {
                    return `${i + 1}. ${r.section_title}\n   質問: この条項の意図を教えていただけますか？`;
                } else if (purpose === "negotiate") {
                    return `${i + 1}. ${r.section_title}\n   希望条件: ${suggestion}`;
                }
                return `${i + 1}. ${r.section_title}\n   修正希望: ${suggestion}`;
            }).join("\n\n");

            return `${preamble[tone][purpose]}${points}${closing[tone][purpose]}`;
        } else if (risk) {
            if (purpose === "question") {
                return `${preamble[tone][purpose]}「${risk.section_title}」について\n\nこの条項の意図を確認させてください。${risk.explanation}${closing[tone][purpose]}`;
            } else if (purpose === "negotiate") {
                return `${preamble[tone][purpose]}「${risk.section_title}」について\n\n希望条件: ${risk.suggestion.revised_text}${closing[tone][purpose]}`;
            }
            return risk.suggestion.negotiation_message[tone];
        }
        return "";
    };

    useEffect(() => {
        if (!isEditing) {
            setGeneratedMessage(generateMessage());
        }
    }, [risk, selectedRisks, tone, purpose, isMultiple, isEditing]);

    if (!risk && !isMultiple) return <div className="p-8 text-center text-slate-400">項目を選択してください</div>;

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setShowFinish(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = () => {
        setIsEditing(false);
        setGeneratedMessage(generateMessage());
    };

    return (
        <div className="flex-1 flex flex-col p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                    {isMultiple ? `${selectedRisks?.length}項目の修正依頼` : "メッセージ作成"}
                </h3>
                <p className="text-slate-500 text-sm">
                    トーンと目的を選んで、メッセージを生成できます。
                </p>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">トーン</p>
                <div className="flex gap-2">
                    {TONE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => { setTone(option.value); setIsEditing(false); }}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${tone === option.value
                                    ? "bg-blue-50 border-blue-300 text-blue-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                        >
                            <span className="mr-1">{option.emoji}</span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Purpose Selection */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">目的</p>
                <div className="flex gap-2">
                    {PURPOSE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => { setPurpose(option.value); setIsEditing(false); }}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${purpose === option.value
                                    ? "bg-teal-50 border-teal-300 text-teal-700"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                        >
                            <span className="mr-1">{option.emoji}</span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500">メッセージ</p>
                    <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        再生成
                    </button>
                </div>
                <Textarea
                    value={generatedMessage}
                    onChange={(e) => { setGeneratedMessage(e.target.value); setIsEditing(true); }}
                    className="flex-1 min-h-[200px] resize-none p-4 text-sm leading-relaxed border-slate-200 focus-visible:ring-slate-300 bg-slate-50/50 rounded-xl"
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
                <Button
                    onClick={handleCopy}
                    className={`w-full rounded-lg shadow-sm transition-all duration-300 ${copied ? "bg-green-600 hover:bg-green-700" : "bg-slate-900 hover:bg-slate-800"
                        }`}
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

                {showFinish && (
                    <Button
                        onClick={onFinish}
                        variant="secondary"
                        className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                    >
                        終了
                    </Button>
                )}
            </div>
        </div>
    );
}

