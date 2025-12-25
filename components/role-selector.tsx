"use client";

import { useState } from "react";
import { ExtractionResult } from "@/lib/types/analysis";
import { Button } from "@/components/ui/button";
import { Check, User } from "lucide-react";

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
        <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">あなたの立場を教えてください</h2>
                <p className="text-slate-500 text-sm">
                    解析精度を高めるため、あなたがどちらの契約当事者かを選択してください。<br />
                    AIが自動抽出した結果を表示しています。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Party A Card */}
                <div
                    className={`
                        relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center space-y-4 hover:shadow-md
                        ${selected === "party_a" ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300 bg-white"}
                    `}
                    onClick={() => setSelected("party_a")}
                >
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${selected === "party_a" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}
                    `}>
                        甲
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Party A</p>
                        <p className="text-lg font-bold text-slate-900 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                            {extractionData.party_a || "名称不明"}
                        </p>
                    </div>
                    {selected === "party_a" && (
                        <div className="absolute top-4 right-4 text-slate-900">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Party B Card */}
                <div
                    className={`
                        relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center space-y-4 hover:shadow-md
                        ${selected === "party_b" ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300 bg-white"}
                    `}
                    onClick={() => setSelected("party_b")}
                >
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${selected === "party_b" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}
                    `}>
                        乙
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Party B</p>
                        <p className="text-lg font-bold text-slate-900 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                            {extractionData.party_b || "名称不明"}
                        </p>
                    </div>
                    {selected === "party_b" && (
                        <div className="absolute top-4 right-4 text-slate-900">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className="rounded-full px-12 py-6 text-base font-medium shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    次へ進む
                </Button>
            </div>

            <p className="text-center text-xs text-slate-300 mt-6">
                ※ 選択中もAIが解析を続けています
            </p>
        </div>
    );
}
