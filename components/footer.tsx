import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12 px-6 font-sans">
            <div className="max-w-xl mx-auto flex flex-col items-center space-y-8">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs text-slate-400 font-light tracking-wide">
                    <Link href="/" className="hover:text-slate-600 transition-colors">ホーム</Link>
                    <Link href="/generate" className="hover:text-slate-600 transition-colors flex items-center gap-1">
                        <span className="text-amber-500">✨</span>
                        契約書を作成
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">β</span>
                    </Link>
                    <Link href="/how-to-use" className="hover:text-slate-600 transition-colors">使い方</Link>
                    <Link href="/check-policy" className="hover:text-slate-600 transition-colors">チェックポリシー</Link>
                    <Link href="/terms" className="hover:text-slate-600 transition-colors">利用規約</Link>
                    <Link href="/privacy" className="hover:text-slate-600 transition-colors">プライバシーポリシー</Link>
                    <Link href="/company" className="hover:text-slate-600 transition-colors">運営会社</Link>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="agree" className="h-6 w-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                    <div className="text-[10px] text-slate-300 tracking-widest uppercase">
                        © 2025 agree
                    </div>
                </div>
            </div>
        </footer>
    );
}
