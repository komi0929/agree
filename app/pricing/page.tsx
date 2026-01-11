"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Shield, History, Copy, FileText, ArrowRight } from "lucide-react";
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
        name: "28項目レポート",
        anonymous: true,
        registered: true,
        anonymousCheck: true,
        registeredCheck: true,
    },
    {
        name: "修正提案テキスト",
        anonymous: true,
        registered: true,
        anonymousCheck: true,
        registeredCheck: true,
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
        name: "AI契約書修正反映",
        anonymous: false,
        registered: "月5回",
        anonymousCheck: false,
        registeredCheck: true,
    },
];

const FAQ = [
    {
        q: "無料登録に必要なものは？",
        a: "メールアドレスのみです。パスワード不要で、メールに届くリンクをクリックするだけでログインできます。",
    },
    {
        q: "契約書のデータは安全ですか？",
        a: "はい。契約書は端末上で処理され、必要最小限のデータのみがAI解析に使用されます。保存データは暗号化されています。",
    },
    {
        q: "解約・退会はできますか？",
        a: "いつでもアカウント設定から退会できます。データは完全に削除されます。",
    },
];

function FeatureValue({ value, isCheck }: { value: boolean | string; isCheck: boolean }) {
    if (typeof value === "string") {
        return <span className="text-sm font-medium text-primary">{value}</span>;
    }
    if (isCheck) {
        return (
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="w-4 h-4 text-green-600" />
            </div>
        );
    }
    return (
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <X className="w-4 h-4 text-muted-foreground" />
        </div>
    );
}

export default function PricingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-primary/10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="agree" className="h-10" />
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAuthModal(true)}
                        className="text-primary hover:text-[#FFD700]"
                    >
                        ログイン
                    </Button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-bold text-primary mb-4">
                        無料で使える、本格的な契約書チェック
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        登録不要ですぐに使えます。
                        <br />
                        無料登録すると、さらに便利な機能が使えるようになります。
                    </p>
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-primary/5 rounded-2xl p-6 mb-16">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-primary/20">
                                <th className="text-left py-4 px-3 text-sm font-medium text-muted-foreground">
                                    機能
                                </th>
                                <th className="text-center py-4 px-3 text-sm font-medium text-muted-foreground w-32">
                                    未登録
                                </th>
                                <th className="text-center py-4 px-3 text-sm font-medium text-primary w-32 bg-primary/10 rounded-t-lg">
                                    無料登録
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, i) => (
                                <tr key={i} className="border-b border-primary/10 last:border-b-0">
                                    <td className="py-4 px-3 text-sm text-foreground">
                                        {feature.name}
                                    </td>
                                    <td className="py-4 px-3 text-center">
                                        <FeatureValue
                                            value={feature.anonymous}
                                            isCheck={feature.anonymousCheck}
                                        />
                                    </td>
                                    <td className="py-4 px-3 text-center bg-primary/5">
                                        <FeatureValue
                                            value={feature.registered}
                                            isCheck={feature.registeredCheck}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* CTA */}
                    <div className="mt-8 text-center">
                        <Button
                            size="lg"
                            onClick={() => setShowAuthModal(true)}
                            className="bg-primary hover:bg-primary/90 hover:text-[#FFD700] text-white px-8 py-6 text-base rounded-full"
                        >
                            無料で登録する
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                            30秒で完了 · クレジットカード不要
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-primary/5 rounded-xl p-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <History className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-primary mb-2">履歴を保存</h3>
                        <p className="text-sm text-muted-foreground">
                            チェック結果を保存して、いつでも見返せます。
                        </p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-6">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Copy className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-primary mb-2">コピー機能</h3>
                        <p className="text-sm text-muted-foreground">
                            修正依頼文をワンクリックでコピー。
                        </p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-primary mb-2">AI契約書生成</h3>
                        <p className="text-sm text-muted-foreground">
                            あなたに有利な契約書をAIが作成。
                        </p>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16">
                    <h2 className="text-xl font-bold text-primary mb-6 text-center">
                        よくある質問
                    </h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <div key={i} className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                                <h3 className="font-medium text-primary mb-2">{item.q}</h3>
                                <p className="text-sm text-muted-foreground">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-10 text-white">
                    <h2 className="text-2xl font-bold mb-4">
                        今すぐ無料で始めましょう
                    </h2>
                    <p className="text-white/80 mb-6">
                        メールアドレスだけで登録完了。
                    </p>
                    <Button
                        size="lg"
                        onClick={() => setShowAuthModal(true)}
                        className="bg-white text-primary hover:bg-white/90 hover:text-[#FFD700] px-8 py-6 text-base rounded-full"
                    >
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
