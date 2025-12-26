"use client";

import { useState } from "react";
import { ExtractionResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface RoleSelectorProps {
    extractionData: ExtractionResult;
    onSelectRole: (role: "party_a" | "party_b") => void;
}

export function RoleSelector({ extractionData, onSelectRole }: RoleSelectorProps) {
    const [selected, setSelected] = useState<"party_a" | "party_b" | null>(null);

    const handleConfirm = () => {
        if (selected) {
            onSelectRole(selected);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress Indicator - Final Step */}
            <div className="flex justify-center gap-2 mb-10">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <div className="w-4 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                    契約書の当事者を確認
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    あなたは「甲」「乙」どちらですか？<br />
                    選択に応じて、あなたの立場から見たリスクを優先的に解析します。
                </p>
            </div>

            {/* Party Selection */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                {/* Party A Card */}
                <div
                    className={`
                        relative p-5 rounded-xl border cursor-pointer transition-all 
                        flex flex-col items-center gap-3
                        ${selected === "party_a"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }
                    `}
                    onClick={() => setSelected("party_a")}
                >
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                        ${selected === "party_a" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}
                    `}>
                        甲
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            {extractionData.party_a || "名称不明"}
                        </p>
                    </div>
                    {selected === "party_a" && (
                        <div className="absolute top-3 right-3 text-slate-600">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Party B Card */}
                <div
                    className={`
                        relative p-5 rounded-xl border cursor-pointer transition-all 
                        flex flex-col items-center gap-3
                        ${selected === "party_b"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }
                    `}
                    onClick={() => setSelected("party_b")}
                >
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                        ${selected === "party_b" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}
                    `}>
                        乙
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
                            {extractionData.party_b || "名称不明"}
                        </p>
                    </div>
                    {selected === "party_b" && (
                        <div className="absolute top-3 right-3 text-slate-600">
                            <Check className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* Contract Type Badge */}
            {extractionData.contract_type && extractionData.contract_type !== "不明" && (
                <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
                        {extractionData.contract_type}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
                <Button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className="w-full h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    解析結果を見る
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
                ※ バックグラウンドで解析を進めています
            </p>
        </div>
    );
}
