"use client";
// app/generate/page.tsx
// 契約書生成 - 入力フォーム画面

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { useUsageLimit } from "@/hooks/use-usage-limit";
import { RegistrationGateModal } from "@/components/auth/registration-gate-modal";
import { ContractInput, validateContractInput } from "@/lib/types/contract-input";
import { generateContractAction } from "./actions";

export default function GeneratePage() {
    const router = useRouter();
    const { isRegistered, hasReachedGenerationLimit, incrementGenerationCount } = useUsageLimit();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGateModal, setShowGateModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // フォーム状態
    const [clientName, setClientName] = useState("");
    const [userName, setUserName] = useState("");
    const [amount, setAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [scopeDescription, setScopeDescription] = useState("");
    const [keepCopyright, setKeepCopyright] = useState(true);
    const [requireDeposit, setRequireDeposit] = useState(true);

    const handleGenerate = async () => {
        // 1. 登録チェック
        if (!isRegistered) {
            setShowGateModal(true);
            return;
        }

        // 2. 回数制限チェック
        if (hasReachedGenerationLimit) {
            setError("今月の生成上限（5回）に達しました。");
            return;
        }

        setError(null);

        const input: ContractInput = {
            clientName,
            userName,
            amount: parseInt(amount.replace(/,/g, ""), 10) || 0,
            deadline,
            scopeDescription,
            options: {
                keepCopyright,
                requireDeposit,
                depositRate: 0.5,
            },
        };

        // バリデーション
        const validation = validateContractInput(input);
        if (!validation.valid) {
            setError(validation.errors.join("\n"));
            return;
        }

        setIsGenerating(true);

        try {
            // カウントをインクリメント
            const success = await incrementGenerationCount();
            if (!success) {
                setError("使用制限の更新に失敗しました。");
                setIsGenerating(false);
                return;
            }

            const result = await generateContractAction(input);

            if (result.success && result.data) {
                // セッションストレージに保存してプレビュー画面へ
                sessionStorage.setItem("contractInput", JSON.stringify(input));
                sessionStorage.setItem("contractResult", JSON.stringify(result.data));
                router.push("/generate/preview");
            } else {
                setError(result.error || "生成に失敗しました");
            }
        } catch (e) {
            setError("予期せぬエラーが発生しました");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            トップに戻る
                        </Link>
                        <span className="text-xs text-primary border border-primary/20 px-2 py-1 rounded-full">β版</span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-primary mb-3">
                        契約書を作成する
                    </h1>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed">
                        必要な情報を入力するだけ。あなたを守る28の条項をAIが自動で組み込みます。
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-8">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl">
                            {error.split("\n").map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-primary mb-2">
                                クライアント名（相手）
                            </label>
                            <Input
                                placeholder="例: 株式会社〇〇"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="h-12 border-primary/20 focus-visible:ring-0 focus-visible:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-primary mb-2">
                                あなたの名前（屋号）
                            </label>
                            <Input
                                placeholder="例: 山田太郎 / 〇〇デザイン事務所"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="h-12 border-primary/20 focus-visible:ring-0 focus-visible:border-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">
                                    金額（税抜）
                                </label>
                                <Input
                                    placeholder="例: 500000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-12 border-primary/20 focus-visible:ring-0 focus-visible:border-primary"
                                    type="text"
                                    inputMode="numeric"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">
                                    納期
                                </label>
                                <Input
                                    placeholder="例: 2025年2月末"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="h-12 border-primary/20 focus-visible:ring-0 focus-visible:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-primary mb-2">
                                業務内容（ラフでOK）
                            </label>
                            <Textarea
                                placeholder="例: LP制作のデザインとコーディング。サーバーアップまで。修正は2回まで。"
                                value={scopeDescription}
                                onChange={(e) => setScopeDescription(e.target.value)}
                                className="min-h-[120px] resize-none border-primary/20 focus-visible:ring-0 focus-visible:border-primary"
                            />
                            <p className="text-xs text-muted-foreground mt-2 font-light">
                                詳細が曖昧でも、AIがあなたに有利な条件で具体化します
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="border-t border-primary/10 pt-8 space-y-4">
                        <h3 className="text-sm font-medium text-primary mb-4">オプション設定</h3>

                        <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-foreground">著作権は譲渡しない</p>
                                <p className="text-xs text-muted-foreground font-light mt-0.5">ライセンス契約として権利を保持</p>
                            </div>
                            <Switch
                                checked={keepCopyright}
                                onCheckedChange={setKeepCopyright}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-foreground">着手金を請求する（50%）</p>
                                <p className="text-xs text-muted-foreground font-light mt-0.5">契約時に半額を受領</p>
                            </div>
                            <Switch
                                checked={requireDeposit}
                                onCheckedChange={setRequireDeposit}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full h-12 bg-primary border-0 text-white hover:bg-primary/90 hover:text-[#FFD700] shadow-sm transition-all text-sm font-medium rounded-full"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    契約書を生成する
                                </>
                            )}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground mt-4 font-light">
                            生成には約10〜20秒かかります
                        </p>
                    </div>
                </div>
            </main>
            <Footer />

            <RegistrationGateModal
                open={showGateModal}
                onClose={() => setShowGateModal(false)}
                reason="generate"
            />
        </div>
    );
}
