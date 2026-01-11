"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Twitter, Mail, ArrowRight } from "lucide-react";

interface EngagementModalProps {
    open: boolean;
    onClose: () => void;
}

export function EngagementModal({ open, onClose }: EngagementModalProps) {
    const [step, setStep] = useState<"initial" | "waitlist_success">("initial");
    const [email, setEmail] = useState("");

    const handleWaitlistSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, send to API
        setTimeout(() => setStep("waitlist_success"), 500);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md animate-in fade-in zoom-in-95 duration-300 bg-background border border-primary/20 sm:rounded-2xl">
                {step === "initial" ? (
                    <>
                        <DialogHeader className="space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 border border-primary/20">
                                <Check className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-center text-xl font-bold text-primary">
                                お疲れ様でした！
                            </DialogTitle>
                            <DialogDescription className="text-center text-muted-foreground leading-relaxed">
                                契約書の確認が完了しました。<br />
                                agreeがあなたの安心に少しでも貢献できていれば嬉しいです。
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-6">
                            {/* Waitlist Section */}
                            <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">COMING SOON</span>
                                    <h4 className="font-bold text-sm text-primary">最強の契約書、作りませんか？</h4>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    フリーランス・クリエイターの皆さんをサポートするアプリを開発しています。
                                    最初からリスクのない、あなたを守る契約書をAIが作成する機能を開発中です。先行利用のお知らせを受け取れます。
                                </p>
                                <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder="メールアドレスを入力"
                                        className="h-9 text-sm bg-white border-primary/20"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 h-9 shrink-0 text-white rounded-full">
                                        登録
                                    </Button>
                                </form>
                            </div>

                            {/* SNS Follow Section */}
                            <div className="text-center space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    開発者のSNSをフォローして、最新情報を受け取る
                                </p>
                                <Button variant="outline" className="w-full h-10 rounded-full hover:bg-primary/5 border-primary/20 text-foreground hover:text-primary">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 text-primary" aria-hidden="true" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    X (Twitter) で開発者をフォロー
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader className="space-y-4 py-8">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 border border-primary/20">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-center text-xl font-bold text-primary">
                                登録ありがとうございます
                            </DialogTitle>
                            <DialogDescription className="text-center text-muted-foreground">
                                新機能の公開準備ができ次第、ご連絡いたします。<br />
                                今しばらくお待ちください。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button onClick={onClose} variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full">
                                閉じる
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
