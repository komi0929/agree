import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-20">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        トップに戻る
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">プライバシーポリシー</h1>
                    <p className="text-slate-500 text-sm">最終更新日: 2025年1月1日</p>
                </div>

                <div className="space-y-12 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. 個人情報の収集について</h2>
                        <p>当社は、本サービスの提供にあたり、必要最小限の個人情報を収集することがあります。これには、お問い合わせ時に入力いただくメールアドレス等が含まれます。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. アップロードデータの取扱い</h2>
                        <p>ユーザーが本サービスにアップロードした契約書ファイル（PDF等）および解析のために入力されたテキストデータ（以下「解析対象データ」）については、以下の通り取り扱います。</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                            <li><strong>利用目的の限定:</strong> 解析対象データは、本サービスによるリスク解析および結果表示のためにのみ利用されます。</li>
                            <li><strong>AIプロバイダーへの送信:</strong> 解析を行うため、解析対象データはOpenAI社等のAI APIプロバイダーに送信されます。API経由で送信されたデータは、通常、AIモデルの学習には利用されない設定（オプトアウト等）で運用することを目指しますが、各プロバイダーの最新の規約に準拠します。</li>
                            <li><strong>保存期間:</strong> 当社サーバー上での解析対象データの一時保存は、解析処理に必要な期間に限定され、解析完了後は速やかに削除されるか、適切なセキュリティ措置のもとで管理されます。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. 第三者提供</h2>
                        <p>当社は、法令に基づく場合または本人の同意がある場合を除き、個人情報を第三者に提供することはありません。（ただし、前項に定める解析処理のためのAPIプロバイダーへのデータ送信を除く）</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. お問い合わせ窓口</h2>
                        <p>本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。</p>
                        <p className="mt-2 font-medium">株式会社ヒトコト<br />E-mail: y.kominami@hitokoto1.co.jp</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
