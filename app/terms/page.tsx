import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
            <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-24 pb-20">
                <PageHeader
                    title="利用規約"
                    description="最終更新日: 2026年1月9日"
                />

                <div className="space-y-12">
                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第1条（はじめに）</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            この利用規約（以下「本規約」）は、株式会社ヒトコト（以下「当社」）が提供する契約書AI解析サービス「agree」（以下「本サービス」）の利用条件を定めるものです。利用者の皆様（以下「ユーザー」）には、本規約に従って本サービスをご利用いただきます。本サービスを利用することにより、ユーザーは本規約の全ての条項に同意したものとみなされます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第2条（サービスの性質と非保証）</h2>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground leading-relaxed font-light">
                            <li>本サービスは、人工知能（AI）を用いて契約書のリスク等を解析し、参考情報を提供するものです。</li>
                            <li><span className="text-foreground font-normal">本サービスが提供する解析結果、修正案、およびメッセージ案は、弁護士法上の「法律事務」を提供するものではなく、法的な助言や法的見解の正確性を保証するものではありません。</span></li>
                            <li>当社は、解析結果の正確性、妥当性、完全性、最新性、および特定の目的への適合性について一切の保証をいたしません。</li>
                            <li>ユーザーは、本サービスの解析結果を自らの責任において判断・利用するものとし、最終的な契約締結の判断や法的な確認が必要な場合は、必ず弁護士等の専門家に相談してください。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第3条（損害賠償の制限）</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            当社は、本サービスの利用に関連してユーザーまたは第三者が被った損害（直接的、間接的、付随的、特別、または派生的な損害を含みますが、これらに限定されません）について、その理由の如何を問わず、一切の責任を負わないものとします。これには、解析結果の誤りに基づく不利益、データの滅失、業務の停止、またはコンピューターの故障等による損害が含まれます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第4条（入力データの取扱いと守秘義務）</h2>
                        <ul className="list-disc pl-5 space-y-3 text-sm text-muted-foreground leading-relaxed font-light">
                            <li>本サービスは、外部のAI API（OpenAI等）を利用して解析を行います。</li>
                            <li>当社は、ユーザーがアップロードした契約書データを、本サービスの提供以外の目的で無断利用することはありません。</li>
                            <li>ユーザーは、機密性の高い情報を含む文書をアップロードする場合、自らの責任において機密保持措置を講じるものとし、アップロードによって生じた情報の漏洩等について、当社は責任を負いません。</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第5条（サービスの変更・中断・終了）</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                            当社は、ユーザーに事前に通知することなく、本サービスの内容を変更し、または本サービスの提供を中断・終了することができるものとします。当社は、これによりユーザーに生じた不利益または損害について、一切の責任を負いません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-medium text-primary mb-4">第6条（準拠法および裁判管轄）</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed font-light">
                            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                            <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所（東京地方裁判所）を専属的合意管轄裁判所とします。</li>
                        </ul>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
