"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, History, Copy, ArrowRight, Zap, Shield, FileText } from "lucide-react";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth/auth-modal";

const FEATURES = [
    {
        name: "契約書チェック",
        anonymous: "月3回",
        registered: "月10回",
        anonymousCheck: true,
        registeredCheck: true,
    },
    {
        name: "28項目リーガルチェック",
        anonymous: true,
        registered: true,
        anonymousCheck: true,
        registeredCheck: true,
    },
    {
        name: "AI修正版テキスト閲覧",
        anonymous: false,
        registered: true,
        anonymousCheck: false,
        registeredCheck: true,
        highlight: true,
    },
    {
        name: "修正依頼文のコピー",
        anonymous: false,
        registered: true,
        anonymousCheck: false,
        registeredCheck: true,
    },
    {
        name: "履歴保存・閲覧",
        anonymous: false,
        registered: "無制限",
        anonymousCheck: false,
        registeredCheck: true,
    },
    {
        name: "AI契約書生成",
        anonymous: false,
        registered: "月5回",
        anonymousCheck: false,
        registeredCheck: true,
    },
    {
        name: "Google Docs連携",
        anonymous: false,
        registered: "Coming Soon",
        anonymousCheck: false,
        registeredCheck: true,
        comingSoon: true,
    },
];

const FAQ = [
    {
        q: "無料登録に必要なものは？",
        a: "メールアドレスのみです。パスワード不要で、メールに届くリンクをクリックするだけでログインできます。",
        emoji: "📧"
    },
    {
        q: "契約書のデータは安全ですか？",
        a: "はい。契約書は端末上で処理され、必要最小限のデータのみがAI解析に使用されます。保存データは暗号化されています。",
        emoji: "🔒"
    },
    {
        q: "解約・退会はできますか？",
        a: "いつでもアカウント設定から退会できます。データは完全に削除されます。",
        emoji: "👋"
    },
];

function FeatureValue({ value, isCheck, highlight, comingSoon }: { value: boolean | string; isCheck: boolean; highlight?: boolean; comingSoon?: boolean }) {
    if (comingSoon) {
        return <span className="text-xs text-neon-yellow px-2 py-0.5 bg-neon-yellow/10 rounded-full">Coming Soon</span>;
    }
    if (typeof value === "string") {
        return <span className={`text-sm font-medium ${highlight ? 'text-neon-green' : 'text-foreground'}`}>{value}</span>;
    }
    if (isCheck) {
        return (
            <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto">
                <Check className="w-4 h-4 text-neon-green" />
            </div>
        );
    }
    return (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto">
            <X className="w-4 h-4 text-muted-foreground" />
        </div>
    );
}

export default function PricingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl">🛡️</span>
                        <span className="text-xl font-bold text-foreground">Agree</span>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAuthModal(true)}
                        className="border-border hover:border-neon-green text-foreground hover:text-neon-green"
                    >
                        ログイン
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm mb-6">
                        <Zap className="w-4 h-4" />
                        永久無料で使える
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        本格的な契約書チェックを
                        <br />
                        <span className="text-neon-green">すべて無料で</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        登録不要ですぐに使えます。
                        無料登録すると、AI修正版や履歴保存などフル機能をアンロック。
                    </p>
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                                    機能
                                </th>
                                <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground w-28">
                                    未登録
                                </th>
                                <th className="text-center py-4 px-4 text-sm font-bold text-neon-green w-28 bg-neon-green/5">
                                    無料登録 ✨
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, i) => (
                                <tr key={i} className={`border-b border-border last:border-b-0 ${feature.highlight ? 'bg-neon-green/5' : ''}`}>
                                    <td className="py-4 px-4 text-sm text-foreground flex items-center gap-2">
                                        {feature.name}
                                        {feature.highlight && (
                                            <span className="text-xs text-neon-green px-2 py-0.5 bg-neon-green/20 rounded-full">New</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <FeatureValue
                                            value={feature.anonymous}
                                            isCheck={feature.anonymousCheck}
                                        />
                                    </td>
                                    <td className="py-4 px-4 text-center bg-neon-green/5">
                                        <FeatureValue
                                            value={feature.registered}
                                            isCheck={feature.registeredCheck}
                                            highlight={feature.highlight}
                                            comingSoon={feature.comingSoon}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* CTA */}
                    <div className="p-6 bg-card border-t border-border text-center">
                        <Button
                            size="lg"
                            onClick={() => setShowAuthModal(true)}
                            className="btn-neon px-8 py-6 text-lg"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            無料で登録する
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                            30秒で完了 · パスワード不要 · クレジットカード不要
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="pop-card">
                        <div className="text-3xl mb-3">📋</div>
                        <h3 className="font-bold text-foreground mb-2">履歴を保存</h3>
                        <p className="text-sm text-muted-foreground">
                            チェック結果を保存して、いつでも見返せます。
                        </p>
                    </div>
                    <div className="pop-card">
                        <div className="text-3xl mb-3">✏️</div>
                        <h3 className="font-bold text-foreground mb-2">AI修正版を閲覧</h3>
                        <p className="text-sm text-muted-foreground">
                            AIが自動修正した契約書をハイライト付きで確認。
                        </p>
                    </div>
                    <div className="pop-card">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="font-bold text-foreground mb-2">ワンクリックコピー</h3>
                        <p className="text-sm text-muted-foreground">
                            修正済み契約書をクリップボードにコピー。
                        </p>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                        よくある質問 🤔
                    </h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <div key={i} className="pop-card">
                                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                    <span>{item.emoji}</span>
                                    {item.q}
                                </h3>
                                <p className="text-sm text-muted-foreground">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center pop-card bg-gradient-to-br from-neon-green/10 to-neon-blue/10 border-neon-green/30 p-10">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        今すぐ無料で始めましょう
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        メールアドレスだけで登録完了。あなたの契約書を守ります。
                    </p>
                    <Button
                        size="lg"
                        onClick={() => setShowAuthModal(true)}
                        className="btn-neon px-8 py-6 text-lg"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        無料で登録する
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </main>

            <Footer />

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}
