"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, Loader2, CheckCircle, LogOut, User, Settings } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signInWithEmail } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const { error } = await signInWithEmail(email);

        if (error) {
            setError("メールの送信に失敗しました。もう一度お試しください。");
            setIsSubmitting(false);
        } else {
            setIsSent(true);
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setIsSent(false);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200 border border-primary/10">
                {!isSent ? (
                    <>
                        <h2 className="text-2xl font-bold text-primary mb-2">
                            アカウント登録 / ログイン
                        </h2>
                        <p className="text-muted-foreground mb-6 text-sm">
                            メールアドレスを入力すると、ログインリンクが届きます。
                            パスワードは不要です。
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                                    メールアドレス
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50 text-foreground"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full py-6 bg-primary hover:bg-primary/90 hover:text-[#FFD700] text-white rounded-full font-medium transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        送信中...
                                    </>
                                ) : (
                                    "ログインリンクを送信"
                                )}
                            </Button>
                        </form>

                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            登録することで、
                            <Link href="/terms" className="underline hover:text-primary mx-1">利用規約</Link>
                            と
                            <Link href="/privacy" className="underline hover:text-primary mx-1">プライバシーポリシー</Link>
                            に同意したものとみなされます。
                        </p>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-primary mb-2">
                            メールを送信しました
                        </h2>
                        <p className="text-muted-foreground mb-6 text-sm">
                            <span className="font-medium text-foreground">{email}</span> に
                            ログインリンクを送信しました。
                            メールを確認してリンクをクリックしてください。
                        </p>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                            閉じる
                        </Button>
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// User menu component for logged in users
export function UserMenu() {
    const { user, profile, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10"
            >
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground max-w-[120px] truncate">
                    {profile?.display_name || user.email?.split("@")[0]}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary/10 py-2 z-50">
                        <div className="px-4 py-3 border-b border-primary/10">
                            <p className="text-[10px] uppercase font-bold text-primary/70 tracking-wider mb-1">Account</p>
                            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                            <Link
                                href="/account"
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center gap-2.5 transition-colors"
                            >
                                <Settings className="w-4 h-4 text-primary/70" />
                                アカウント設定
                            </Link>
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                                <LogOut className="w-4 h-4 text-red-400" />
                                ログアウト
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
