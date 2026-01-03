import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { AlertTriangle, Shield, Info, Scale, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "チェックポリシー | agree",
    description: "agreeが契約書をどのような観点でチェックしているかをご説明します。28項目のチェックポイントで、フリーランス・クリエイターの皆さまを守ります。",
};

// 28項目のチェックポイントデータ
const checkpoints = {
    mustFix: [
        { no: 1, name: "支払サイト", description: "「60日以内」の支払いを確保（フリーランス新法第4条）" },
        { no: 2, name: "検収起算日", description: "支払いの起算点が「納品日」になっているか" },
        { no: 3, name: "著作権譲渡", description: "著作権法27条・28条の権利が適切に処理されているか" },
        { no: 4, name: "損害賠償", description: "賠償上限が設定されているか、逸失利益が除外されているか" },
        { no: 5, name: "中途解除", description: "一方的な解除権だけでなく、相互解除権があるか" },
        { no: 6, name: "業務範囲", description: "業務範囲が明確か、無限追加作業のリスクがないか" },
        { no: 7, name: "競業避止", description: "競業避止の期間・範囲が適切か（2年以上は無効の可能性）" },
        { no: 8, name: "契約不適合責任", description: "責任期間が長すぎないか（3〜6ヶ月が目安）" },
        { no: 9, name: "裁判管轄", description: "裁判管轄が一方的に発注者有利になっていないか" },
        { no: 10, name: "再委託禁止", description: "完全禁止は偽装請負のリスク、事前承諾制が望ましい" },
        { no: 11, name: "AI学習利用", description: "成果物のAI学習利用に関する取り決めがあるか" },
    ],
    shouldAdd: [
        { no: 12, name: "みなし検収", description: "検収放置による未払い防止（最重要）", highlight: true },
        { no: 13, name: "遅延利息", description: "支払遅延時のペナルティ規定" },
        { no: 14, name: "消費税明記", description: "税込・税別の明確化" },
        { no: 15, name: "経費負担", description: "実費の負担者を明確化" },
        { no: 16, name: "着手金", description: "長期案件での資金繰り確保" },
        { no: 17, name: "中途解約精算", description: "プロジェクト頓挫時のタダ働き防止", highlight: true },
        { no: 18, name: "物価・仕様変更", description: "インフレや要件変更への対応余地" },
    ],
    recommended: [
        { no: 19, name: "履行遅滞免責", description: "クライアント起因の遅れによる納期遅延の免責" },
        { no: 20, name: "AIツール利用", description: "業務でのAIツール利用許可" },
        { no: 21, name: "背景IP留保", description: "既存のコード・ノウハウの権利留保" },
        { no: 22, name: "実績公開権", description: "ポートフォリオとして使える権利" },
        { no: 23, name: "クレジット表記", description: "著作者名を表示する権利" },
        { no: 24, name: "引き抜き禁止", description: "チームメンバーの直接勧誘禁止" },
        { no: 25, name: "連絡対応時間", description: "深夜休日の対応強要防止" },
        { no: 26, name: "ハラスメント解除", description: "悪質クライアントからの即時離脱権" },
        { no: 27, name: "特急料金", description: "短納期依頼への割増料金" },
        { no: 28, name: "自動更新", description: "継続案件の契約更新の手間削減" },
    ],
};

export default function CheckPolicyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader
                    title="チェックポリシー"
                    description="agreeは透明性を大切にしています。どのような観点で契約書をチェックしているか、ここで全てお伝えします。"
                />

                {/* イントロセクション */}
                <section className="mb-16">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                                <Scale className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-base font-medium text-slate-900">私たちのチェック哲学</h2>
                                <p className="text-sm text-slate-500 leading-relaxed font-light">
                                    多くのフリーランス・クリエイターの方が、不利な契約条件を知らずに受け入れてしまっています。
                                    agreeは「見落としより誤検知が安全」という設計思想のもと、少しでもリスクがある箇所は積極的にお伝えします。
                                    最終的な判断はあなた自身が行いますが、その判断材料をできる限り提供することが私たちの役割です。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 28項目の概要 */}
                <section className="mb-12">
                    <div className="flex gap-4 items-center mb-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-slate-900">28項目のチェックポイント</h2>
                            <p className="text-sm text-slate-500 font-light">3つのカテゴリに分けてチェックしています</p>
                        </div>
                    </div>

                    {/* 修正すべき項目 */}
                    <div className="mb-10">
                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-slate-900">修正すべき条項（11項目）</h3>
                                <p className="text-xs text-slate-400">契約書に存在すると危険な条項</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {checkpoints.mustFix.map((item) => (
                                    <div key={item.no} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex gap-3 items-start">
                                            <span className="flex-shrink-0 w-6 h-6 bg-red-50 rounded text-xs font-medium text-red-600 flex items-center justify-center">
                                                {item.no.toString().padStart(2, "0")}
                                            </span>
                                            <div>
                                                <span className="text-sm font-medium text-slate-800">{item.name}</span>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 追加すべき項目 */}
                    <div className="mb-10">
                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-slate-900">追加すべき条項（7項目）</h3>
                                <p className="text-xs text-slate-400">契約書に含めるべき保護条項</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {checkpoints.shouldAdd.map((item) => (
                                    <div
                                        key={item.no}
                                        className={`px-4 py-3 transition-colors ${item.highlight ? "bg-amber-50/30" : "hover:bg-slate-50/50"}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <span className={`flex-shrink-0 w-6 h-6 rounded text-xs font-medium flex items-center justify-center ${item.highlight ? "bg-amber-100 text-amber-700" : "bg-amber-50 text-amber-600"}`}>
                                                {item.no.toString().padStart(2, "0")}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                                                    {item.highlight && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">重要</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* その他推奨項目 */}
                    <div className="mb-10">
                        <div className="flex gap-3 items-center mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                <Info className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-slate-900">その他推奨条項（10項目）</h3>
                                <p className="text-xs text-slate-400">あると望ましい推奨条項</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                            <div className="divide-y divide-slate-50">
                                {checkpoints.recommended.map((item) => (
                                    <div key={item.no} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex gap-3 items-start">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded text-xs font-medium text-blue-600 flex items-center justify-center">
                                                {item.no.toString().padStart(2, "0")}
                                            </span>
                                            <div>
                                                <span className="text-sm font-medium text-slate-800">{item.name}</span>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* チェック方式の説明 */}
                <section className="mb-16">
                    <div className="flex gap-4 items-center mb-6">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <Zap className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-slate-900">ハイブリッドチェック方式</h2>
                            <p className="text-sm text-slate-500 font-light">確実性と文脈理解を両立</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-5">
                            <h4 className="text-sm font-medium text-slate-800 mb-2">ルールベースチェック（確実性100%）</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                「翌々月末払い」「一切の損害を賠償」など、確定的にリスクがある表現をパターンマッチングで100%検知します。
                                法律で明確に禁止されている事項や、一般的に危険とされる表現は見逃しません。
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-5">
                            <h4 className="text-sm font-medium text-slate-800 mb-2">AI解析（文脈理解）</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                単純なパターンマッチングでは判断できない、文脈に依存するリスクをAIが解析します。
                                条項同士の関係性や、業界特有の慣習なども考慮してアドバイスします。
                            </p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-5">
                            <h4 className="text-sm font-medium text-slate-800 mb-2">欠落チェック（沈黙は危険）</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                契約書に「書かれていないこと」が最大のリスクになることがあります。
                                みなし検収条項や中途解約精算規定など、あるべき保護条項が欠落していないかもチェックします。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 注意事項 */}
                <section className="mb-16">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">ご注意ください</h3>
                        <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>agreeのチェック結果は参考情報であり、法的助言ではありません。</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>重要な契約については、弁護士など専門家への相談をお勧めします。</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-slate-400">•</span>
                                <span>業界や案件の特性によって、適切な条項は異なる場合があります。</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all text-sm font-normal"
                    >
                        契約書をチェックする
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
