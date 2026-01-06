
export function AnalysisResultPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-40 py-20">
            <div className="p-6 bg-slate-50 rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="agree - 契約書チェックAI" className="h-8 w-auto opacity-30 grayscale" />
            </div>
            <div className="space-y-2">
                <p className="text-slate-500 font-light">
                    ここにチェック結果が表示されます
                </p>
                <p className="text-xs text-slate-400 font-light">
                    左のフォームからファイルをアップロードしてください
                </p>
            </div>
        </div>
    );
}
