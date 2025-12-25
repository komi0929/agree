import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader
                    title="利用規約"
                    description="最終更新日: 2025年1月1日"
                />

                <div className="space-y-12">
                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">第1条（はじめに）</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            この利用規約（以下「本規約」）は、株式会社ヒトコト（以下「当社」）が提供する契約書AI解析サービス「agree」（以下「本サービス」）の利用条件を定めるものです。利用者の皆様（以下「ユーザー」）には、本規約に従って本サービスをご利用いただきます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">第2条（サービスの性質と免責）</h2>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-slate-500 leading-relaxed font-light">
                            <li>本サービスは、人工知能（AI）を用いて契約書のリスク等を解析し、参考情報を提供するものです。</li>
                            <li><span className="text-slate-700 font-normal">本サービスが提供する解析結果は、弁護士法上の「法律事務」を提供するものではなく、法的な助言や法的見解を保証するものではありません。</span></li>
                            <li>当社は、解析結果の正確性、完全性、最新性について一切の保証をいたしません。</li>
                            <li>ユーザーは、本サービスの解析結果を自らの責任判断において利用するものとし、最終的な契約締結の判断や法的な確認が必要な場合は、必ず弁護士等の専門家に相談してください。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">第3条（入力データの取扱い）</h2>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-slate-500 leading-relaxed font-light">
                            <li>本サービスは、OpenAI社のAPI等を利用して解析を行います。</li>
                            <li>機密性の高い情報や個人情報を含む文書をアップロードする場合、ユーザーは自らの責任においてこれを行うものとします。</li>
                            <li>当社は、ユーザーがアップロードした契約書データを、解析以外の目的（当社のAIモデルの学習など）で無断利用することはありませんが、APIプロバイダーのポリシーに従い処理されることをユーザーは承諾するものとします。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">第4条（禁止事項）</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light mb-3">
                            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-500 leading-relaxed font-light">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>当社のシステムの機能を破壊したり、妨害したりする行為</li>
                            <li>他のユーザーに成りすます行為</li>
                            <li>その他、当社が不適切と判断する行為</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
