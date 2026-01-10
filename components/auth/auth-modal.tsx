"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle, LogOut, User } from "lucide-react";

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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
                {!isSent ? (
                    <>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            アカウント登録 / ログイン
                        </h2>
                        <p className="text-slate-500 mb-6">
                            メールアドレスを入力すると、ログインリンクが届きます。
                            パスワードは不要です。
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                    メールアドレス
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
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

                        <p className="text-xs text-slate-400 mt-4 text-center">
                            登録することで、
                            <a href="/terms" className="underline hover:text-slate-600">利用規約</a>
                            と
                            <a href="/privacy" className="underline hover:text-slate-600">プライバシーポリシー</a>
                            に同意したものとみなされます。
                        </p>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            メールを送信しました
                        </h2>
                        <p className="text-slate-500 mb-6">
                            <span className="font-medium text-slate-700">{email}</span> に
                            ログインリンクを送信しました。
                            メールを確認してリンクをクリックしてください。
                        </p>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="rounded-xl"
                        >
                            閉じる
                        </Button>
                    </div>
                )}

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
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
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700 max-w-[120px] truncate">
                    {profile?.display_name || user.email?.split("@")[0]}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                            <p className="text-xs text-slate-400">ログイン中</p>
                            <p className="text-sm text-slate-700 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                signOut();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            ログアウト
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
