"use client";

import { useState, useEffect } from "react";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { RegistrationGateModal } from "@/components/auth/registration-gate-modal";
import { cn } from "@/lib/utils";


interface MessageCrafterProps {
    risk: EnhancedAnalysisResult["risks"][0] | null;
    selectedRisks?: EnhancedAnalysisResult["risks"];
    onFinish: () => void;
}

type MessageTone = "formal" | "neutral" | "casual";
type MessagePurpose = "request" | "question" | "negotiate" | "yesBut";

const TONE_OPTIONS = [
    { value: "formal" as const, label: "かしこまって 🎩", description: "敬語で丁重に" },
    { value: "neutral" as const, label: "ビジネスライクに 🤝", description: "対等な立場で" },
    { value: "casual" as const, label: "フレンドリーに 😊", description: "気軽に" },
];

const PURPOSE_OPTIONS = [
    { value: "request" as const, label: "直してほしい" },
    { value: "question" as const, label: "確認したい" },
    { value: "negotiate" as const, label: "条件を相談" },
    { value: "yesBut" as const, label: "上手に断る" },
];

export function MessageCrafter({ risk, selectedRisks, onFinish }: MessageCrafterProps) {
    const { user } = useAuth();
    const [tone, setTone] = useState<MessageTone>("neutral");
    const [purpose, setPurpose] = useState<MessagePurpose>("request");
    const [copied, setCopied] = useState(false);
    const [showFinish, setShowFinish] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showGateModal, setShowGateModal] = useState(false);

    const isMultiple = selectedRisks && selectedRisks.length > 0;

    const generateMessage = () => {
        const preamble = {
            formal: {
                request: "お世話になっております。\n契約書の内容を確認いたしました。\n以下の点について、修正をお願いしたく存じます。\n\n",
                question: "お世話になっております。\n契約書を拝見いたしました。\n以下の点についてご確認させていただきたくご連絡いたしました。\n\n",
                negotiate: "お世話になっております。\n契約書を確認いたしました。\n以下の点について、条件のご相談をさせていただけますでしょうか。\n\n",
                yesBut: "お世話になっております。\n契約書を確認いたしました。\nご提示いただいた条件について、大変ありがたく存じます。\nつきましては、一部ご相談させていただきたい点がございます。\n\n",
            },
            neutral: {
                request: "お疲れ様です。\n契約書を確認しました。\n以下の箇所について修正をお願いできますでしょうか。\n\n",
                question: "お疲れ様です。\n契約書を確認しました。\n以下の点について質問があります。\n\n",
                negotiate: "お疲れ様です。\n契約書を確認しました。\n以下の条件について相談させてください。\n\n",
                yesBut: "お疲れ様です。\n契約書を確認しました。\nご提示いただいた条件、ありがとうございます。\n概ね問題ございませんが、一部相談させてください。\n\n",
            },
            casual: {
                request: "契約書見ました！\nちょっと以下の点だけ気になったので、相談させてください。\n\n",
                question: "契約書見ました！\n以下の点がちょっと分からなくて、教えてほしいです。\n\n",
                negotiate: "契約書見ました！\n以下の条件についてちょっと相談したいのですが…\n\n",
                yesBut: "契約書見ました！\n基本的にはOKです！\nただ、ちょっとだけ相談したい点がありまして…\n\n",
            },
        };

        const closing = {
            formal: {
                request: "\n\nお手数をおかけしますが、ご検討のほどよろしくお願いいたします。",
                question: "\n\nお忙しいところ恐れ入りますが、ご回答いただけますと幸いです。",
                negotiate: "\n\nご多用中恐縮ですが、ご検討いただけますと幸いです。",
                yesBut: "\n\n上記以外の条件については、問題なく進められると考えております。\nご検討のほど、よろしくお願いいたします。",
            },
            neutral: {
                request: "\n\nご確認よろしくお願いいたします。",
                question: "\n\nご回答よろしくお願いします。",
                negotiate: "\n\nご検討よろしくお願いします。",
                yesBut: "\n\n上記以外は問題ありません。\nご検討よろしくお願いします。",
            },
            casual: {
                request: "\n\nよろしくお願いします！",
                question: "\n\nよろしくお願いします！",
                negotiate: "\n\nよろしくお願いします！",
                yesBut: "\n\nそれ以外はバッチリです！\nよろしくお願いします！",
            },
        };

        if (isMultiple && selectedRisks) {
            // 優先度別にグルーピング
            const mustChange = selectedRisks.filter(r => r.risk_level === "critical" || r.risk_level === "high");
            const wouldAppreciate = selectedRisks.filter(r => r.risk_level === "medium" || r.risk_level === "low");

            let body = "";

            // 「必ず修正いただきたい点」セクション
            if (mustChange.length > 0) {
                const sectionHeader = {
                    formal: "【必ず修正をお願いしたい点】\n以下の点につきましては、契約を進める上で重要な問題となる可能性がございます。\n\n",
                    neutral: "【必ず修正いただきたい点】\n以下は契約を進める上で重要な点です。\n\n",
                    casual: "【ここは必ず直してほしいです】\n\n",
                };
                // Yes, But話法用のセクションヘッダー
                const yesButheader = {
                    formal: "【ご相談させていただきたい点】\n以下の点について、もう少しご配慮いただけると大変助かります。\n\n",
                    neutral: "【調整いただきたい点】\n以下の点だけ調整いただけると助かります。\n\n",
                    casual: "【ここだけ相談させてください】\n\n",
                };
                body += purpose === "yesBut" ? yesButheader[tone] : sectionHeader[tone];

                mustChange.forEach((r, i) => {
                    const suggestion = r.suggestion.revised_text || "（修正案をご提案）";
                    const reason = r.practical_impact || r.explanation;

                    if (purpose === "question") {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   この条項の意図をお聞かせいただけますでしょうか。\n`;
                        body += `   懸念点：${reason}\n\n`;
                    } else if (purpose === "negotiate") {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   理由：${reason}\n`;
                        body += `   希望条件：${suggestion}\n\n`;
                    } else if (purpose === "yesBut") {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   趣旨は理解いたしますが、${reason}\n`;
                        body += `   可能であれば：${suggestion}\n\n`;
                    } else {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   理由：${reason}\n`;
                        body += `   修正希望：${suggestion}\n\n`;
                    }
                });
            }

            // 「ご検討いただけると助かる点」セクション
            if (wouldAppreciate.length > 0 && purpose !== "yesBut") {
                const sectionHeader = {
                    formal: "【ご検討いただけますと幸いな点】\n以下の点につきましては、可能であればご調整いただけると大変助かります。\n\n",
                    neutral: "【できればご検討いただきたい点】\n以下は必須ではありませんが、調整いただけると助かります。\n\n",
                    casual: "【できれば相談したい点】\n\n",
                };
                body += sectionHeader[tone];

                wouldAppreciate.forEach((r, i) => {
                    const suggestion = r.suggestion.revised_text || "（柔軟にご相談）";

                    if (purpose === "question") {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   こちらについてもご意向をお聞かせいただけると助かります。\n\n`;
                    } else {
                        body += `${i + 1}. 「${r.section_title}」について\n`;
                        body += `   ご希望：${suggestion}\n\n`;
                    }
                });
            }

            return `${preamble[tone][purpose]}${body.trim()}${closing[tone][purpose]}`;
        } else if (risk) {
            if (purpose === "question") {
                return `${preamble[tone][purpose]}「${risk.section_title}」について\n\nこの条項の意図を確認させてください。${risk.explanation}${closing[tone][purpose]}`;
            } else if (purpose === "negotiate") {
                return `${preamble[tone][purpose]}「${risk.section_title}」について\n\n希望条件: ${risk.suggestion.revised_text}${closing[tone][purpose]}`;
            } else if (purpose === "yesBut") {
                const reason = risk.practical_impact || risk.explanation;
                const suggestion = risk.suggestion.revised_text || "（代替案をご提案）";
                return `${preamble[tone][purpose]}「${risk.section_title}」について\n\n趣旨は理解いたしますが、${reason}\n可能であれば: ${suggestion}${closing[tone][purpose]}`;
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

    if (!risk && !isMultiple) return <div className="p-8 text-center text-muted-foreground">項目を選択してください</div>;

    const handleCopy = () => {
        // Gate: require registration to copy
        if (!user) {
            setShowGateModal(true);
            return;
        }
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
                <h3 className="text-lg font-bold text-foreground">
                    {isMultiple ? `${selectedRisks?.length}項目の修正依頼` : "相手に送るメッセージを一緒に考えよう 💬"}
                </h3>
                <p className="text-muted-foreground text-sm">
                    角が立たない言い方で、ちゃんと主張を通すよ
                </p>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">どんな雰囲気で？</p>
                <div className="flex gap-2">
                    {TONE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => { setTone(option.value); setIsEditing(false); }}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                tone === option.value
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-primary"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Purpose Selection */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">何を伝えたい？</p>
                <div className="flex gap-2">
                    {PURPOSE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => { setPurpose(option.value); setIsEditing(false); }}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                                purpose === option.value
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-primary"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">メッセージ</p>
                    <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        再生成
                    </button>
                </div>
                <Textarea
                    value={generatedMessage}
                    onChange={(e) => { setGeneratedMessage(e.target.value); setIsEditing(true); }}
                    className="flex-1 min-h-[200px] resize-none p-4 text-sm leading-relaxed border-primary/20 focus-visible:ring-primary/30 bg-white/50 rounded-xl font-mono text-foreground"
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
                <Button
                    onClick={handleCopy}
                    className={cn(
                        "w-full rounded-lg shadow-sm transition-all duration-300",
                        copied ? "bg-primary hover:bg-primary/90" : "bg-primary hover:bg-primary/90"
                    )}
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
                        className="w-full rounded-lg bg-white hover:bg-primary/5 text-muted-foreground border border-primary/20"
                    >
                        終了
                    </Button>
                )}
            </div>

            {/* Registration Gate Modal */}
            <RegistrationGateModal
                open={showGateModal}
                onClose={() => setShowGateModal(false)}
                reason="copy"
                onSuccess={() => {
                    setShowGateModal(false);
                    // Auto-copy after successful registration
                    navigator.clipboard.writeText(generatedMessage);
                    setCopied(true);
                    setShowFinish(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
            />
        </div>
    );
}

