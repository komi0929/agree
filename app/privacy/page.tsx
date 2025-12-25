import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-600 font-sans selection:bg-slate-100 selection:text-slate-900">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader
                    title="プライバシーポリシー"
                    description="最終更新日: 2025年1月1日"
                />

                <div className="space-y-12">
                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">1. 個人情報の収集について</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            当社は、本サービスの提供にあたり、必要最小限の個人情報を収集することがあります。これには、お問い合わせ時に入力いただくメールアドレス等が含まれます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">2. アップロードデータの取扱い</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light mb-3">
                            ユーザーが本サービスにアップロードした契約書ファイル（PDF等）および解析のために入力されたテキストデータ（以下「解析対象データ」）については、以下の通り取り扱います。
                        </p>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-slate-500 leading-relaxed font-light">
                            <li><span className="text-slate-700 font-normal">利用目的の限定:</span> 解析対象データは、本サービスによるリスク解析および結果表示のためにのみ利用されます。</li>
                            <li><span className="text-slate-700 font-normal">AIプロバイダーへの送信:</span> 解析を行うため、解析対象データはOpenAI社等のAI APIプロバイダーに送信されます。API経由で送信されたデータは、通常、AIモデルの学習には利用されない設定で運用することを目指しますが、各プロバイダーの最新の規約に準拠します。</li>
                            <li><span className="text-slate-700 font-normal">保存期間:</span> 当社サーバー上での解析対象データの一時保存は、解析処理に必要な期間に限定され、解析完了後は速やかに削除されるか、適切なセキュリティ措置のもとで管理されます。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">3. 第三者提供</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            当社は、法令に基づく場合または本人の同意がある場合を除き、個人情報を第三者に提供することはありません。（ただし、前項に定める解析処理のためのAPIプロバイダーへのデータ送信を除く）
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-slate-900 mb-4">4. お問い合わせ窓口</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-light">
                            本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
                        </p>
                        <p className="mt-4 text-sm text-slate-600">
                            株式会社ヒトコト<br />
                            E-mail: y.kominami@hitokoto1.co.jp
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
