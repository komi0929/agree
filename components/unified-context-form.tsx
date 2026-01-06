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

// Consistent step number badge component
function StepBadge({ number, isRequired }: { number: number; isRequired?: boolean }) {
    return (
        <span className={`
            flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
            ${isRequired ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}
        `}>
            {number}
        </span>
    );
}

// Consistent option card for 2-column layout
function OptionCard({
    isSelected,
    onClick,
    icon,
    title,
    subtitle,
    className = ""
}: {
    isSelected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    className?: string;
}) {
    return (
        <div
            className={`
                relative p-4 rounded-xl border cursor-pointer transition-all
                flex items-center gap-3 min-h-[56px]
                ${isSelected
                    ? "border-blue-400 bg-blue-50/50 shadow-sm ring-1 ring-blue-200"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                }
                ${className}
            `}
            onClick={onClick}
        >
            <div className="shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{title}</p>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
            {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
        </div>
    );
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

            {/* Quick Start Option - Unified styling with other sections */}
            {onSkip && (
                <div className="mb-8">
                    <div
                        className="p-4 rounded-xl border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:border-amber-300 transition-all group"
                        onClick={onSkip}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                    <Zap className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">クイックスタート</p>
                                    <p className="text-xs text-slate-500">デフォルト設定ですぐに解析開始</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">または、詳細を設定</span>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Main Form - All sections in one view */}
            <div className="space-y-8">

                {/* Section 1: Role (甲/乙) Selection - Most Important */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <StepBadge number={1} isRequired />
                        <h3 className="font-medium text-slate-800">あなたはどちらですか？</h3>
                        <span className="text-xs text-red-500 font-medium">必須</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Party A Card */}
                        <div
                            className={`
                                relative p-5 rounded-xl border-2 cursor-pointer transition-all 
                                flex flex-col items-center gap-3 min-h-[140px]
                                ${selectedRole === "party_a"
                                    ? "border-blue-400 bg-blue-50/50 shadow-md"
                                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                                }
                            `}
                            onClick={() => setSelectedRole("party_a")}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors
                                ${selectedRole === "party_a" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}
                            `}>
                                甲
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs text-slate-400 mb-1">検出された名称</p>
                                <p className="text-sm font-medium text-slate-800 line-clamp-2 break-all leading-snug">
                                    {extractionData.party_a || "不明"}
                                </p>
                            </div>
                            {selectedRole === "party_a" && (
                                <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                        </div>

                        {/* Party B Card */}
                        <div
                            className={`
                                relative p-5 rounded-xl border-2 cursor-pointer transition-all 
                                flex flex-col items-center gap-3 min-h-[140px]
                                ${selectedRole === "party_b"
                                    ? "border-blue-400 bg-blue-50/50 shadow-md"
                                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                                }
                            `}
                            onClick={() => setSelectedRole("party_b")}
                        >
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors
                                ${selectedRole === "party_b" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}
                            `}>
                                乙
                            </div>
                            <div className="text-center w-full">
                                <p className="text-xs text-slate-400 mb-1">検出された名称</p>
                                <p className="text-sm font-medium text-slate-800 line-clamp-2 break-all leading-snug">
                                    {extractionData.party_b || "不明"}
                                </p>
                            </div>
                            {selectedRole === "party_b" && (
                                <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: User Role (受注者/発注者) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={2} />
                        <h3 className="font-medium text-slate-800">あなたの立場</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">任意</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <OptionCard
                            isSelected={context.userRole === "vendor"}
                            onClick={() => updateContext({ userRole: "vendor" })}
                            icon={<User className="w-5 h-5 text-slate-500" />}
                            title="受注者"
                            subtitle="仕事を請ける側"
                        />
                        <OptionCard
                            isSelected={context.userRole === "client"}
                            onClick={() => updateContext({ userRole: "client" })}
                            icon={<Building2 className="w-5 h-5 text-slate-500" />}
                            title="発注者"
                            subtitle="仕事を依頼する側"
                        />
                    </div>
                </div>

                {/* Section 3: Entity Type */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={3} />
                        <h3 className="font-medium text-slate-800">事業形態</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">任意</span>
                    </div>

                    <div className="space-y-2">
                        <OptionCard
                            isSelected={context.userEntityType === "individual"}
                            onClick={() => updateContext({ userEntityType: "individual" })}
                            icon={<User className="w-5 h-5 text-slate-500" />}
                            title="個人事業主 / フリーランス"
                        />
                        <OptionCard
                            isSelected={context.userEntityType === "one_person_corp"}
                            onClick={() => updateContext({ userEntityType: "one_person_corp" })}
                            icon={<Building2 className="w-5 h-5 text-slate-500" />}
                            title="一人法人（従業員なし）"
                        />
                        <OptionCard
                            isSelected={context.userEntityType === "corp_with_employees"}
                            onClick={() => updateContext({ userEntityType: "corp_with_employees" })}
                            icon={<Users className="w-5 h-5 text-slate-500" />}
                            title="従業員がいる法人"
                        />
                    </div>
                </div>

                {/* Section 4: Counterparty Capital */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={4} />
                        <h3 className="font-medium text-slate-800">取引先の資本金</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">任意</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <OptionCard
                            isSelected={context.counterpartyCapital === "unknown"}
                            onClick={() => updateContext({ counterpartyCapital: "unknown" })}
                            icon={<HelpCircle className="w-5 h-5 text-slate-500" />}
                            title="わからない"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "under_10m"}
                            onClick={() => updateContext({ counterpartyCapital: "under_10m" })}
                            icon={<span className="w-5 h-5 flex items-center justify-center text-xs text-slate-500 font-medium">¥</span>}
                            title="1,000万円以下"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "10m_to_300m"}
                            onClick={() => updateContext({ counterpartyCapital: "10m_to_300m" })}
                            icon={<span className="w-5 h-5 flex items-center justify-center text-xs text-slate-500 font-medium">¥¥</span>}
                            title="1,000万〜3億円"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "over_300m"}
                            onClick={() => updateContext({ counterpartyCapital: "over_300m" })}
                            icon={<span className="w-5 h-5 flex items-center justify-center text-xs text-slate-500 font-medium">¥¥¥</span>}
                            title="3億円超"
                        />
                    </div>
                </div>
            </div>

            {/* Actions - B-2: Specific button labels */}
            <div className="mt-10 sticky bottom-6 bg-white/90 backdrop-blur-sm p-4 -mx-4 rounded-xl border border-slate-100 shadow-lg">
                <Button
                    onClick={handleComplete}
                    disabled={!isComplete}
                    className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-base font-medium transition-colors"
                >
                    {isComplete ? (
                        <>
                            リスクを解析する
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        "上の「甲」または「乙」を選択してください"
                    )}
                </Button>
                {isComplete && (
                    <p className="text-center text-xs text-slate-400 mt-3">
                        Enterキーでも開始できます
                    </p>
                )}
            </div>
        </div>
    );
}
