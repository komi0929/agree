"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { useUsageLimit } from "@/hooks/use-usage-limit";
import { Footer } from "@/components/footer";
import {
    User,
    Mail,
    BarChart3,
    LogOut,
    Trash2,
    ArrowLeft,
    Shield,
    Loader2,
    Check,
    AlertTriangle,
} from "lucide-react";

export default function AccountPage() {
    const router = useRouter();
    const { user, profile, signOut, isLoading: authLoading } = useAuth();
    const {
        plan,
        isAdmin,
        checkCount,
        checkLimit,
        generationCount,
        generationLimit,
        isLoading: usageLoading,
    } = useUsageLimit();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Redirect to home if not logged in
    if (!authLoading && !user) {
        router.push("/");
        return null;
    }

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        router.push("/");
    };

    const formatLimit = (count: number, limit: number) => {
        if (limit === Infinity) return `${count}回使用 (無制限)`;
        return `${count} / ${limit}回`;
    };

    const getResetDate = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const days = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `あと${days}日でリセット`;
    };

    if (authLoading || usageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-primary/10">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">ホームに戻る</span>
                    </Link>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="agree" className="h-8" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-primary mb-8">アカウント設定</h1>

                {/* Profile Section */}
                <section className="bg-white rounded-xl border border-primary/20 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{user?.email}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isAdmin
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {isAdmin ? "管理者" : "無料プラン"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user?.email}</span>
                    </div>
                </section>

                {/* Usage Stats */}
                <section className="bg-white rounded-xl border border-primary/20 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h2 className="font-medium text-primary">今月の使用状況</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-foreground">契約書チェック</span>
                                <span className="text-sm font-medium text-primary">
                                    {formatLimit(checkCount, checkLimit)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{
                                        width: checkLimit === Infinity
                                            ? "10%"
                                            : `${Math.min(100, (checkCount / checkLimit) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-foreground">AI契約書生成</span>
                                <span className="text-sm font-medium text-primary">
                                    {formatLimit(generationCount, generationLimit)}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all"
                                    style={{
                                        width: generationLimit === Infinity
                                            ? "10%"
                                            : `${Math.min(100, (generationCount / generationLimit) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">{getResetDate()}</p>
                </section>

                {/* Actions */}
                <section className="bg-white rounded-xl border border-primary/20 divide-y divide-primary/10">
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-primary/5 transition-colors"
                    >
                        {isSigningOut ? (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                            <LogOut className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-foreground">ログアウト</span>
                    </button>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <span className="text-red-600">アカウントを削除する</span>
                        </button>
                    ) : (
                        <div className="px-6 py-4 bg-red-50">
                            <div className="flex items-center gap-2 text-red-600 mb-3">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-medium">本当に削除しますか？</span>
                            </div>
                            <p className="text-sm text-red-600 mb-4">
                                この操作は取り消せません。すべてのデータが削除されます。
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => {
                                        // TODO: Implement account deletion
                                        alert("アカウント削除機能は準備中です");
                                    }}
                                >
                                    削除する
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Security Note */}
                <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                        あなたのデータは安全に保護されています。詳しくは
                        <Link href="/privacy" className="text-primary hover:underline">
                            プライバシーポリシー
                        </Link>
                        をご確認ください。
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
