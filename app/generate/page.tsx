"use client";
// app/generate/page.tsx
// 契約書生成 - 入力フォーム画面

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sparkles, FileText, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { ContractInput, DEFAULT_CONTRACT_OPTIONS, validateContractInput } from "@/lib/types/contract-input";
import { generateContractAction } from "./actions";

export default function GeneratePage() {
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">戻る</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">β版</span>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>AI契約書ジェネレーター</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        30秒で<span className="text-blue-600">最強</span>の契約書を作成
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        必要な情報を入力するだけ。あなたを守る28の条項をAIが自動で組み込みます。
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
                        <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">28の保護条項</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
                        <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">30秒で完成</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl border border-slate-100">
                        <FileText className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">すぐにコピー</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg">
                            {error.split("\n").map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                クライアント名（相手）
                            </label>
                            <Input
                                placeholder="例: 株式会社〇〇"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                あなたの名前（屋号）
                            </label>
                            <Input
                                placeholder="例: 山田太郎 / 〇〇デザイン事務所"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    金額（税抜）
                                </label>
                                <Input
                                    placeholder="例: 500000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-12"
                                    type="text"
                                    inputMode="numeric"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    納期
                                </label>
                                <Input
                                    placeholder="例: 2025年2月末"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                業務内容（ラフでOK）
                            </label>
                            <Textarea
                                placeholder="例: LP制作のデザインとコーディング。サーバーアップまで。修正は2回まで。"
                                value={scopeDescription}
                                onChange={(e) => setScopeDescription(e.target.value)}
                                className="min-h-[120px] resize-none"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                詳細が曖昧でも、AIがあなたに有利な条件で具体化します
                            </p>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <h3 className="text-sm font-medium text-slate-700">オプション設定</h3>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-slate-800">著作権は譲渡しない</p>
                                <p className="text-xs text-slate-500">ライセンス契約として権利を保持</p>
                            </div>
                            <Switch
                                checked={keepCopyright}
                                onCheckedChange={setKeepCopyright}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-slate-800">着手金を請求する（50%）</p>
                                <p className="text-xs text-slate-500">契約時に半額を受領</p>
                            </div>
                            <Switch
                                checked={requireDeposit}
                                onCheckedChange={setRequireDeposit}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-base font-medium rounded-xl"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                生成中...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                最強の契約書を生成する
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-slate-400">
                        生成には約10〜20秒かかります
                    </p>
                </div>
            </main>
        </div>
    );
}
