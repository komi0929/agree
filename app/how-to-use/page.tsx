import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Search, ShieldCheck } from "lucide-react";

export default function HowToUsePage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        トップに戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">agreeの使い方</h1>
                    <p className="text-slate-500 text-sm">3つのステップで、契約書のリスクをチェックできます。</p>
                </div>

                <div className="space-y-16">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <UploadCloud className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900">Step 1. 契約書をアップロード</h2>
                            <p className="text-slate-600 leading-relaxed font-light">
                                トップページから、チェックしたい契約書のPDFファイルをドラッグ＆ドロップしてください。<br />
                                公開されているPDFのURLを直接入力することも可能です。
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900">Step 2. AIが自動解析</h2>
                            <p className="text-slate-600 leading-relaxed font-light">
                                最新のAIが契約書の内容を読み込み、フリーランスにとって不利な条項やリスクがないかを数秒で解析します。<br />
                                解析中は少しだけお待ちください。
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <ShieldCheck className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-slate-900">Step 3. 結果の確認と修正</h2>
                            <p className="text-slate-600 leading-relaxed font-light">
                                解析結果が表示されます。リスクのある箇所には「修正案」や、相手方に送るための「交渉メッセージ」も提案されます。<br />
                                これらを参考に、安心して契約を結んでください。
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link href="/" className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-slate-900 text-white hover:bg-slate-700 transition-colors text-sm">
                        さっそく使ってみる
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
