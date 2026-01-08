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
                    description="3つのステップで、契約書の気になる点を確認できます。"
                />

                <div className="space-y-14">
                    {/* Step 1 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <UploadCloud className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 1. 契約書をお預けください</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                トップページから、確認したい契約書のPDFファイルをドラッグ&ドロップしてください。URLからの確認も可能です。
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <Search className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 2. 内容を確認します</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                契約書の内容を読み込み、あなたにとって不利な条項やリスクがないかを確認いたします。15秒ほどお待ちください。
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <h2 className="text-base font-medium text-slate-900">Step 3. 結果と、お伝えする言葉をご提案</h2>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                確認結果をお見せします。気になる箇所には「修正のご提案」や、先方へお伝えするための「メッセージ案」もご用意いたします。これらを参考に、安心して契約をお進めください。
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full px-8 py-4 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all text-sm font-normal"
                    >
                        さっそく使ってみる
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
