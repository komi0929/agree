import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CompanyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        トップに戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">運営会社</h1>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                    <dl className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-y-8 gap-x-4">
                        <dt className="font-bold text-slate-900">会社名</dt>
                        <dd className="text-slate-600">株式会社ヒトコト</dd>

                        <dt className="font-bold text-slate-900">代表者</dt>
                        <dd className="text-slate-600">代表取締役 〇〇 〇〇（※必要に応じて記載）</dd>

                        <dt className="font-bold text-slate-900">所在地</dt>
                        <dd className="text-slate-600">〒000-0000<br />（※住所を記載）</dd>

                        <dt className="font-bold text-slate-900">事業内容</dt>
                        <dd className="text-slate-600">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>AI活用サービスの企画・開発・運営</li>
                                <li>コンサルティング事業</li>
                            </ul>
                        </dd>

                        <dt className="font-bold text-slate-900">連絡先</dt>
                        <dd className="text-slate-600">y.kominami@hitokoto1.co.jp</dd>
                    </dl>
                </div>
            </main>
            <Footer />
        </div>
    );
}
