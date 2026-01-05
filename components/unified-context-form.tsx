"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserContext, UserEntityType, CapitalRange, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { ExtractionResult } from "@/lib/types/analysis";
import { Building2, User, Users, HelpCircle, ArrowRight, Check, Zap } from "lucide-react";

interface UnifiedContextFormProps {
    extractionData: ExtractionResult;
    onComplete: (context: UserContext, role: "party_a" | "party_b") => void;
    onSkip?: () => void;
}

/**
 * A-1: Unified Context Form
 * Combines user context (3 steps) + role selection into a single screen
 * with good defaults and "skip to analyze" option
 */
export function UnifiedContextForm({ extractionData, onComplete, onSkip }: UnifiedContextFormProps) {
    // B-1: Good defaults - pre-select common options
    const [context, setContext] = useState<UserContext>({
        ...DEFAULT_USER_CONTEXT,
        userRole: "vendor", // Default: 受注者 (most common for freelancers)
        userEntityType: "individual", // Default: 個人事業主
        counterpartyCapital: "unknown", // Default: わからない (safest)
    });
    const [selectedRole, setSelectedRole] = useState<"party_a" | "party_b" | null>(null);

    // B-5: Restore previous settings from LocalStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("agreeUserContext");
            if (saved) {
                const parsed = JSON.parse(saved);
                setContext(prev => ({ ...prev, ...parsed }));
            }
        } catch {
            // Ignore errors
        }
    }, []);

    const updateContext = (updates: Partial<UserContext>) => {
        setContext(prev => ({ ...prev, ...updates }));
    };

    const handleComplete = () => {
        if (!selectedRole) return;

        // B-5: Save settings to LocalStorage for next time
        try {
            localStorage.setItem("agreeUserContext", JSON.stringify(context));
        } catch {
            // Ignore storage errors
        }

        onComplete(context, selectedRole);
    };

    // B-5: Enter key shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && selectedRole) {
                e.preventDefault();
                handleComplete();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedRole, context]);

    const isComplete = selectedRole !== null;

    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                    解析設定
                </h2>
                <p className="text-sm text-slate-500">
                    より正確な解析のために、いくつか教えてください
                </p>
            </div>

            {/* Quick Start Option - A-1: Skip option */}
            {onSkip && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-500" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">クイックスタート</p>
                                <p className="text-xs text-slate-500">設定をスキップしてすぐに解析を開始</p>
                            </div>
                        </div>
                        {/* C-2: Ensure minimum touch target size */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSkip}
                            className="rounded-full text-xs min-h-[44px] px-4"
                            aria-label="設定をスキップしてすぐに解析を開始"
                        >
                            スキップして解析
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Form - All sections in one view */}
            <div className="space-y-8">

                {/* Section 1: Role (甲/乙) Selection - Most Important */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold">1</span>
                        <h3 className="font-medium text-slate-800">あなたはどちらですか？</h3>
                        <span className="text-xs text-red-500">*必須</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Party A Card */}
                        <div
                            className={`
                                relative p-4 rounded-xl border cursor-pointer transition-all 
                                flex flex-col items-center gap-2
                                ${selectedRole === "party_a"
                                    ? "border-slate-400 bg-white shadow-sm ring-2 ring-slate-200"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                }
                            `}
                            onClick={() => setSelectedRole("party_a")}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                ${selectedRole === "party_a" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}
                            `}>
                                甲
                            </div>
                            <div className="text-center w-full bg-slate-50 rounded-lg py-2 px-2 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-0.5">検出された名称</p>
                                <p className="text-sm font-bold text-slate-800 line-clamp-2 break-all leading-snug">
                                    {extractionData.party_a || "（名称不明）"}
                                </p>
                            </div>
                            {selectedRole === "party_a" && (
                                <div className="absolute top-2 right-2 text-slate-600">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Party B Card */}
                        <div
                            className={`
                                relative p-4 rounded-xl border cursor-pointer transition-all 
                                flex flex-col items-center gap-2
                                ${selectedRole === "party_b"
                                    ? "border-slate-400 bg-white shadow-sm ring-2 ring-slate-200"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                }
                            `}
                            onClick={() => setSelectedRole("party_b")}
                        >
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                ${selectedRole === "party_b" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}
                            `}>
                                乙
                            </div>
                            <div className="text-center w-full bg-slate-50 rounded-lg py-2 px-2 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-0.5">検出された名称</p>
                                <p className="text-sm font-bold text-slate-800 line-clamp-2 break-all leading-snug">
                                    {extractionData.party_b || "（名称不明）"}
                                </p>
                            </div>
                            {selectedRole === "party_b" && (
                                <div className="absolute top-2 right-2 text-slate-600">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: User Role (受注者/発注者) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">2</span>
                        <h3 className="font-medium text-slate-800">あなたの立場</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">デフォルト設定済</span>
                    </div>

                    <RadioGroup
                        value={context.userRole}
                        onValueChange={(v) => updateContext({ userRole: v as "vendor" | "client" })}
                        className="grid grid-cols-2 gap-3"
                    >
                        <Label
                            htmlFor="vendor"
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${context.userRole === "vendor"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                            <User className="w-5 h-5 text-slate-500 shrink-0" />
                            <div>
                                <div className="font-medium text-slate-800 text-sm">受注者</div>
                                <div className="text-xs text-slate-400">仕事を請ける側</div>
                            </div>
                            {context.userRole === "vendor" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="client"
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${context.userRole === "client"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="client" id="client" className="sr-only" />
                            <Building2 className="w-5 h-5 text-slate-500 shrink-0" />
                            <div>
                                <div className="font-medium text-slate-800 text-sm">発注者</div>
                                <div className="text-xs text-slate-400">仕事を依頼する側</div>
                            </div>
                            {context.userRole === "client" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>
                    </RadioGroup>
                </div>

                {/* Section 3: Entity Type */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">3</span>
                        <h3 className="font-medium text-slate-800">事業形態</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">デフォルト設定済</span>
                    </div>

                    <RadioGroup
                        value={context.userEntityType}
                        onValueChange={(v) => updateContext({ userEntityType: v as UserEntityType })}
                        className="space-y-2"
                    >
                        <Label
                            htmlFor="individual-unified"
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "individual"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="individual" id="individual-unified" className="sr-only" />
                            <User className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-800">個人事業主 / フリーランス</span>
                            {context.userEntityType === "individual" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="one_person_corp-unified"
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "one_person_corp"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="one_person_corp" id="one_person_corp-unified" className="sr-only" />
                            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-800">一人法人（従業員なし）</span>
                            {context.userEntityType === "one_person_corp" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="corp_with_employees-unified"
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "corp_with_employees"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="corp_with_employees" id="corp_with_employees-unified" className="sr-only" />
                            <Users className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-800">従業員がいる法人</span>
                            {context.userEntityType === "corp_with_employees" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>
                    </RadioGroup>
                </div>

                {/* Section 4: Counterparty Capital */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">4</span>
                        <h3 className="font-medium text-slate-800">取引先の資本金</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">デフォルト設定済</span>
                    </div>

                    <RadioGroup
                        value={context.counterpartyCapital}
                        onValueChange={(v) => updateContext({ counterpartyCapital: v as CapitalRange | "unknown" })}
                        className="grid grid-cols-2 gap-2"
                    >
                        <Label
                            htmlFor="unknown-unified"
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "unknown"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="unknown" id="unknown-unified" className="sr-only" />
                            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-sm text-slate-800">わからない</span>
                            {context.counterpartyCapital === "unknown" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="under_10m-unified"
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "under_10m"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="under_10m" id="under_10m-unified" className="sr-only" />
                            <span className="text-sm text-slate-800">1,000万円以下</span>
                            {context.counterpartyCapital === "under_10m" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="10m_to_300m-unified"
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "10m_to_300m"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="10m_to_300m" id="10m_to_300m-unified" className="sr-only" />
                            <span className="text-sm text-slate-800">1,000万〜3億円</span>
                            {context.counterpartyCapital === "10m_to_300m" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>

                        <Label
                            htmlFor="over_300m-unified"
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "over_300m"
                                ? "border-slate-400 bg-white shadow-sm"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <RadioGroupItem value="over_300m" id="over_300m-unified" className="sr-only" />
                            <span className="text-sm text-slate-800">3億円超</span>
                            {context.counterpartyCapital === "over_300m" && <Check className="w-4 h-4 text-slate-600 ml-auto" />}
                        </Label>
                    </RadioGroup>
                </div>
            </div>

            {/* Actions - B-2: Specific button labels */}
            <div className="mt-10 sticky bottom-6 bg-white/80 backdrop-blur-sm p-4 -mx-4 rounded-xl border border-slate-100 shadow-lg">
                <Button
                    onClick={handleComplete}
                    disabled={!isComplete}
                    className="w-full h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed text-base font-medium"
                >
                    リスクを解析する
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!isComplete && (
                    <p className="text-center text-xs text-slate-400 mt-3">
                        「甲」または「乙」を選択してください
                    </p>
                )}
                {isComplete && (
                    <p className="text-center text-xs text-slate-400 mt-3">
                        Enterキーでも開始できます
                    </p>
                )}
            </div>
        </div>
    );
}
