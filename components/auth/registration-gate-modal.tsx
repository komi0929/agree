"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/auth-context";
import { Check, ClipboardCopy, History, Sparkles, Loader2, Mail } from "lucide-react";

type GateReason = "copy" | "history" | "generate" | "limit";

interface RegistrationGateModalProps {
    open: boolean;
    onClose: () => void;
    reason: GateReason;
    onSuccess?: () => void;
}

const REASON_MESSAGES: Record<GateReason, { title: string; description: string }> = {
    copy: {
        title: "修正依頼文をコピーするには登録が必要です",
        description: "コピー機能を使って、相手に送るメッセージを簡単に作成できます。",
    },
    history: {
        title: "履歴を保存するには登録が必要です",
        description: "過去のチェック結果を保存して、いつでも見返すことができます。",
    },
    generate: {
        title: "AI契約書生成には登録が必要です",
        description: "AIがあなたに有利な契約書を自動で作成します。",
    },
    limit: {
        title: "今月の無料チェック回数を使い切りました",
        description: "無料登録すると月5回までチェックできるようになります。",
    },
};

const BENEFITS = [
    { icon: History, text: "過去10件の履歴を保存" },
    { icon: ClipboardCopy, text: "修正依頼文のコピー機能" },
    { icon: Sparkles, text: "月5回までチェック可能" },
];

export function RegistrationGateModal({ open, onClose, reason, onSuccess }: RegistrationGateModalProps) {
    const { signInWithEmail } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<"form" | "sent" | "success">("form");

    const { title, description } = REASON_MESSAGES[reason];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signInWithEmail(email);
            if (result.error) {
                setError("メールの送信に失敗しました。もう一度お試しください。");
            } else {
                setStep("sent");
            }
        } catch (err) {
            setError("エラーが発生しました。もう一度お試しください。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("form");
        setEmail("");
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-background border border-primary/20 sm:rounded-2xl">
                {step === "form" ? (
                    <>
                        <DialogHeader className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-center text-xl font-bold text-primary">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-center text-muted-foreground">
                                {description}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-6">
                            {/* Benefits */}
                            <div className="bg-primary/5 rounded-2xl p-4 space-y-3 border border-primary/10">
                                <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">
                                    無料登録で使える機能
                                </p>
                                <div className="space-y-2">
                                    {BENEFITS.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <benefit.icon className="w-3 h-3 text-primary" />
                                            </div>
                                            <span className="text-sm text-foreground">{benefit.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <Input
                                        type="email"
                                        placeholder="メールアドレス"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 bg-white border-primary/20 focus-visible:ring-primary"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-full hover:text-[#FFD700]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            送信中...
                                        </>
                                    ) : (
                                        "ログインリンクを送信"
                                    )}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground">
                                    パスワード不要 · メールリンクでログイン
                                </p>
                            </form>
                        </div>
                    </>
                ) : step === "sent" ? (
                    <div className="py-12 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-in zoom-in duration-200 border border-primary/20">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-primary">
                            メールを送信しました
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            <span className="font-medium text-foreground">{email}</span> 宛に
                            <br />ログインリンクを送信しました。
                            <br />メールに記載のリンクをクリックしてください。
                        </DialogDescription>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="mt-4 rounded-full border-primary/20 text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        >
                            閉じる
                        </Button>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-in zoom-in duration-200 border border-primary/20">
                            <Check className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-primary">
                            登録完了！
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            機能が使えるようになりました
                        </DialogDescription>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
