"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserContext, UserEntityType, CapitalRange, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { ExtractionResult } from "@/lib/types/analysis";
import { Building2, User, Users, HelpCircle, ArrowRight, Check, Briefcase } from "lucide-react";

interface UnifiedContextFormProps {
    extractionData: ExtractionResult;
    onComplete: (context: UserContext, role: "party_a" | "party_b") => void;
    onSkip?: () => void;
}

// Consistent step number badge - all same style
function StepBadge({ number }: { number: number }) {
    return (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">
            {number}
        </span>
    );
}

// Consistent option card - unified height
function OptionCard({
    isSelected,
    onClick,
    icon,
    title,
    subtitle,
}: {
    isSelected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <div
            className={`
                relative p-4 rounded-xl border cursor-pointer transition-all
                flex items-center gap-3 min-h-[60px]
                ${isSelected
                    ? "border-slate-400 bg-slate-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }
            `}
            onClick={onClick}
        >
            {icon && <div className="shrink-0 text-slate-500">{icon}</div>}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{title}</p>
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
            {isSelected && <Check className="w-4 h-4 text-slate-600 shrink-0" />}
        </div>
    );
}

export function UnifiedContextForm({ extractionData, onComplete, onSkip }: UnifiedContextFormProps) {
    const [context, setContext] = useState<UserContext>({
        ...DEFAULT_USER_CONTEXT,
        userRole: "vendor", // Default: 受注者
        userEntityType: "individual",
        counterpartyCapital: "unknown",
    });
    // Default to 乙 (party_b) since most users are vendors/受注者
    const [selectedRole, setSelectedRole] = useState<"party_a" | "party_b" | null>("party_b");

    // Restore previous settings
    useEffect(() => {
        try {
            const saved = localStorage.getItem("agreeUserContext");
            if (saved) {
                const parsed = JSON.parse(saved);
                setContext(prev => ({ ...prev, ...parsed }));
            }
        } catch {
            // Ignore
        }
    }, []);

    const updateContext = (updates: Partial<UserContext>) => {
        setContext(prev => ({ ...prev, ...updates }));
    };

    const handleComplete = () => {
        if (!selectedRole) return;
        try {
            localStorage.setItem("agreeUserContext", JSON.stringify(context));
        } catch {
            // Ignore
        }
        onComplete(context, selectedRole);
    };

    // Enter key shortcut
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
            {/* Quick Start - Friendly design */}
            {onSkip && (
                <div className="mb-6">
                    <div
                        className="p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-all group"
                        onClick={onSkip}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">すぐに見てもらう</p>
                                    <p className="text-xs text-slate-400">おまかせ設定でスタート</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">詳しく設定する場合</span>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Main Form */}
            <div className="space-y-6">

                {/* Section 1: Role Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={1} />
                        <h3 className="text-sm font-medium text-slate-700">あなたは？</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <OptionCard
                            isSelected={selectedRole === "party_a"}
                            onClick={() => setSelectedRole("party_a")}
                            icon={
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole === "party_a" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    甲
                                </div>
                            }
                            title={extractionData.party_a || "不明"}
                            subtitle="契約書の「甲」"
                        />
                        <OptionCard
                            isSelected={selectedRole === "party_b"}
                            onClick={() => setSelectedRole("party_b")}
                            icon={
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole === "party_b" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    乙
                                </div>
                            }
                            title={extractionData.party_b || "不明"}
                            subtitle="契約書の「乙」"
                        />
                    </div>
                </div>

                {/* Section 2: User Role */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={2} />
                        <h3 className="text-sm font-medium text-slate-700">あなたの立場</h3>
                        <span className="text-xs text-slate-400">任意</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <OptionCard
                            isSelected={context.userRole === "vendor"}
                            onClick={() => updateContext({ userRole: "vendor" })}
                            icon={<User className="w-5 h-5" />}
                            title="受注者"
                            subtitle="仕事を請ける側"
                        />
                        <OptionCard
                            isSelected={context.userRole === "client"}
                            onClick={() => updateContext({ userRole: "client" })}
                            icon={<Building2 className="w-5 h-5" />}
                            title="発注者"
                            subtitle="仕事を依頼する側"
                        />
                    </div>
                </div>

                {/* Section 3: Entity Type */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={3} />
                        <h3 className="text-sm font-medium text-slate-700">事業形態</h3>
                        <span className="text-xs text-slate-400">任意</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <OptionCard
                            isSelected={context.userEntityType === "individual"}
                            onClick={() => updateContext({ userEntityType: "individual" })}
                            icon={<User className="w-5 h-5" />}
                            title="個人事業主 / フリーランス"
                        />
                        <OptionCard
                            isSelected={context.userEntityType === "one_person_corp"}
                            onClick={() => updateContext({ userEntityType: "one_person_corp" })}
                            icon={<Building2 className="w-5 h-5" />}
                            title="一人法人（従業員なし）"
                        />
                        <OptionCard
                            isSelected={context.userEntityType === "corp_with_employees"}
                            onClick={() => updateContext({ userEntityType: "corp_with_employees" })}
                            icon={<Users className="w-5 h-5" />}
                            title="従業員がいる法人"
                        />
                    </div>
                </div>

                {/* Section 4: Counterparty Capital */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <StepBadge number={4} />
                        <h3 className="text-sm font-medium text-slate-700">取引先の資本金</h3>
                        <span className="text-xs text-slate-400">任意</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <OptionCard
                            isSelected={context.counterpartyCapital === "unknown"}
                            onClick={() => updateContext({ counterpartyCapital: "unknown" })}
                            icon={<HelpCircle className="w-5 h-5" />}
                            title="わからない"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "under_10m"}
                            onClick={() => updateContext({ counterpartyCapital: "under_10m" })}
                            title="1,000万円以下"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "10m_to_300m"}
                            onClick={() => updateContext({ counterpartyCapital: "10m_to_300m" })}
                            title="1,000万〜3億円"
                        />
                        <OptionCard
                            isSelected={context.counterpartyCapital === "over_300m"}
                            onClick={() => updateContext({ counterpartyCapital: "over_300m" })}
                            title="3億円超"
                        />
                    </div>
                </div>
            </div>

            {/* Action Button - Friendly text */}
            <div className="mt-8 sticky bottom-4">
                <Button
                    onClick={handleComplete}
                    disabled={!isComplete}
                    className="w-full h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-base font-medium transition-colors"
                >
                    {isComplete ? (
                        <>
                            契約書を確認してもらう
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        "「甲」または「乙」を選んでください"
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
