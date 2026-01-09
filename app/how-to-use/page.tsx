import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { UploadCloud, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function HowToUsePage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader
                    title="agreeの使い方"
                    description="たった3つのステップで、契約書のリスクを素早く診断します。"
                />

                <div className="space-y-14">
                    {/* Step 1 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <UploadCloud className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 1. 契約書をアップロード</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                診断したい契約書のPDFファイルをドラッグ＆ドロップ、またはURLの入力やテキストの貼り付けを行ってください。
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 2. AIによるリスク解析</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                AIが条項を一文ずつ精査し、あなたにとって不利な条件や、本来あるべき重要項目の欠落がないかを解析します。
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 3. 診断結果と修正案を確認</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                解析結果に基づき、リスクの解説、具体的な「修正案」、および先方へ伝えるための「交渉メッセージ案」を提案します。
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 shadow-lg transition-all text-sm font-medium"
                    >
                        今すぐ診断を始める
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
