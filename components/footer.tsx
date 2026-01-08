import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto flex flex-col items-center">

                {/* Service Navigation (Primary) - C-7: Use noun form */}
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-10">
                    <Link href="/generate" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                        契約書作成
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">β</span>
                    </Link>
                    <Link href="/how-to-use" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">ガイド</Link>
                    <Link href="/check-policy" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">チェックポリシー</Link>
                </div>

                {/* Legal & Corporate text (Secondary) */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-12">
                    <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">利用規約</Link>
                    <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">プライバシーポリシー</Link>
                    <Link href="/company" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">運営会社</Link>
                </div>

                {/* Brand */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-[10px] text-slate-300 tracking-widest uppercase font-medium">
                        © 2026 株式会社ヒトコト
                    </div>
                </div>
            </div>
        </footer>
    );
}
