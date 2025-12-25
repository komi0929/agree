import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default function CompanyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader title="運営会社" />

                <div className="border border-slate-200 rounded-xl p-8">
                    <dl className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:gap-8">
                            <dt className="text-sm font-medium text-slate-900 sm:w-32 mb-1 sm:mb-0">会社名</dt>
                            <dd className="text-sm text-slate-500 font-light">株式会社ヒトコト</dd>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:gap-8">
                            <dt className="text-sm font-medium text-slate-900 sm:w-32 mb-1 sm:mb-0">代表者</dt>
                            <dd className="text-sm text-slate-500 font-light">代表取締役 小南優作</dd>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:gap-8">
                            <dt className="text-sm font-medium text-slate-900 sm:w-32 mb-1 sm:mb-0">所在地</dt>
                            <dd className="text-sm text-slate-500 font-light">非公開</dd>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:gap-8">
                            <dt className="text-sm font-medium text-slate-900 sm:w-32 mb-1 sm:mb-0">事業内容</dt>
                            <dd className="text-sm text-slate-500 font-light">
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>AI活用サービスの企画・開発・運営</li>
                                    <li>コンサルティング事業</li>
                                </ul>
                            </dd>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:gap-8">
                            <dt className="text-sm font-medium text-slate-900 sm:w-32 mb-1 sm:mb-0">連絡先</dt>
                            <dd className="text-sm text-slate-500 font-light">y.kominami@hitokoto1.co.jp</dd>
                        </div>
                    </dl>
                </div>
            </main>
            <Footer />
        </div>
    );
}
