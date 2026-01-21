import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-background border-t border-primary/10 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto flex flex-col items-center">

                {/* Guardian Manager Message */}
                <div className="mb-8 text-center">
                    <p className="text-sm text-primary/80 font-medium">
                        契約書チェックはお任せください！<br />
                        <span className="text-muted-foreground">あなたは最高の作品を生み出すことに集中して。💪</span>
                    </p>
                </div>

                {/* Service Navigation (Primary) - C-7: Use noun form */}
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-10">
                    <Link href="/generate" className="text-sm font-medium text-primary hover:text-[#FFD700] transition-colors flex items-center gap-2">
                        契約書作成
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">β</span>
                    </Link>
                    <Link href="/how-to-use" className="text-sm font-medium text-primary hover:text-[#FFD700] transition-colors">使い方ガイド</Link>
                    <Link href="/check-policy" className="text-sm font-medium text-primary hover:text-[#FFD700] transition-colors">チェックポリシー</Link>
                </div>

                {/* Legal & Corporate text (Secondary) */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-12">
                    <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">利用規約</Link>
                    <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">プライバシーポリシー</Link>
                    <Link href="/company" className="text-xs text-muted-foreground hover:text-primary transition-colors">運営会社</Link>
                </div>

                {/* Brand */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-[10px] text-muted-foreground/50 tracking-widest uppercase font-medium">
                        © 2026 株式会社ヒトコト
                    </div>
                </div>
            </div>
        </footer>
    );
}
