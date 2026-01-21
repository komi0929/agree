import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface Props {
    risks: any[];
    isLoggedIn: boolean;
    onShowFix?: () => void;
}

export function RiskCardsSummary({ risks, isLoggedIn, onShowFix }: Props) {
    const criticalCount = risks.filter(r => r.risk_level === "critical").length;
    const highCount = risks.filter(r => r.risk_level === "high").length;
    const mediumCount = risks.filter(r => r.risk_level === "medium").length;
    const lowCount = risks.filter(r => r.risk_level === "low").length;

    return (
        <div className="bg-white rounded-xl border p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold">危険: {criticalCount + highCount}件</span>
                </div>
                <div className="flex items-center gap-2 text-amber-500">
                    <Info className="w-5 h-5" />
                    <span className="font-bold">注意: {mediumCount}件</span>
                </div>
                <div className="flex items-center gap-2 text-blue-500">
                    <Info className="w-5 h-5" />
                    <span className="font-bold">確認: {lowCount}件</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {!isLoggedIn && (
                    <p className="text-xs text-muted-foreground hidden md:block">
                        無料登録でAIによる修正案を確認できます
                    </p>
                )}
                <button
                    onClick={onShowFix}
                    className={`
                        px-4 py-2 rounded-lg font-bold text-sm transition-all
                        ${isLoggedIn 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }
                    `}
                >
                    {isLoggedIn ? "AI修正版を見る" : "AI修正版（無料）"}
                </button>
            </div>
        </div>
    );
}
