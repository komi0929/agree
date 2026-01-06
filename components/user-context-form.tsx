"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserContext, UserEntityType, CapitalRange, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { Building2, User, Users, HelpCircle, ArrowRight } from "lucide-react";

interface UserContextFormProps {
    onComplete: (context: UserContext) => void;
    initialContext?: Partial<UserContext>;
}

export function UserContextForm({ onComplete, initialContext }: UserContextFormProps) {
    const [step, setStep] = useState(1);
    const [context, setContext] = useState<UserContext>({
        ...DEFAULT_USER_CONTEXT,
        ...initialContext,
    });

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            onComplete(context);
        }
    };

    const updateContext = (updates: Partial<UserContext>) => {
        setContext(prev => ({ ...prev, ...updates }));
    };

    // Step titles and descriptions for flow
    const stepContent = {
        1: {
            title: "あなたの立場を教えてください",
            description: "契約書のどちら側として確認しますか？",
        },
        2: {
            title: "あなたの事業形態は？",
            description: "適用される法律を正確に判定するために教えてください",
        },
        3: {
            title: "最後に、取引先について",
            description: "相手方の規模に応じて適用法規が変わります",
        },
    };

    const currentStep = stepContent[step as keyof typeof stepContent];

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-10">
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${s === step
                            ? "bg-slate-800 w-4"
                            : s < step
                                ? "bg-slate-400"
                                : "bg-slate-200"
                            }`}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                    {currentStep.title}
                </h2>
                <p className="text-sm text-slate-500">
                    {currentStep.description}
                </p>
            </div>

            {/* Step 1: Role Selection */}
            {step === 1 && (
                <RadioGroup
                    value={context.userRole}
                    onValueChange={(v) => updateContext({ userRole: v as "vendor" | "client" })}
                    className="grid grid-cols-2 gap-4"
                >
                    <Label
                        htmlFor="vendor"
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border cursor-pointer transition-all ${context.userRole === "vendor"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                        <User className="w-7 h-7 text-slate-500" />
                        <div className="text-center">
                            <div className="font-medium text-slate-800">受注者</div>
                            <div className="text-xs text-slate-400 mt-1">仕事を請ける側</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="client"
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border cursor-pointer transition-all ${context.userRole === "client"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="client" id="client" className="sr-only" />
                        <Building2 className="w-7 h-7 text-slate-500" />
                        <div className="text-center">
                            <div className="font-medium text-slate-800">発注者</div>
                            <div className="text-xs text-slate-400 mt-1">仕事を依頼する側</div>
                        </div>
                    </Label>
                </RadioGroup>
            )}

            {/* Step 2: Entity Type */}
            {step === 2 && (
                <RadioGroup
                    value={context.userEntityType}
                    onValueChange={(v) => updateContext({ userEntityType: v as UserEntityType })}
                    className="space-y-3"
                >
                    <Label
                        htmlFor="individual"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "individual"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="individual" id="individual" className="sr-only" />
                        <User className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                            <div className="font-medium text-slate-800">個人事業主 / フリーランス</div>
                            <div className="text-xs text-slate-400">開業届を出している個人</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="one_person_corp"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "one_person_corp"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="one_person_corp" id="one_person_corp" className="sr-only" />
                        <Building2 className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                            <div className="font-medium text-slate-800">一人法人（従業員なし）</div>
                            <div className="text-xs text-slate-400">法人化しているが従業員はいない</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="corp_with_employees"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.userEntityType === "corp_with_employees"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="corp_with_employees" id="corp_with_employees" className="sr-only" />
                        <Users className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                            <div className="font-medium text-slate-800">従業員がいる法人</div>
                            <div className="text-xs text-slate-400">1名以上の従業員を雇用</div>
                        </div>
                    </Label>
                </RadioGroup>
            )}

            {/* Step 3: Counterparty Capital */}
            {step === 3 && (
                <RadioGroup
                    value={context.counterpartyCapital}
                    onValueChange={(v) => updateContext({ counterpartyCapital: v as CapitalRange | "unknown" })}
                    className="space-y-3"
                >
                    <Label
                        htmlFor="unknown"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "unknown"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="unknown" id="unknown" className="sr-only" />
                        <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                            <div className="font-medium text-slate-800">わからない / 未確認</div>
                            <div className="text-xs text-slate-400">最も保守的な判定を行います</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="under_10m"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "under_10m"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="under_10m" id="under_10m" className="sr-only" />
                        <div>
                            <div className="font-medium text-slate-800">1,000万円以下</div>
                            <div className="text-xs text-slate-400">スタートアップ・中小企業</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="10m_to_300m"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "10m_to_300m"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="10m_to_300m" id="10m_to_300m" className="sr-only" />
                        <div>
                            <div className="font-medium text-slate-800">1,000万円超〜3億円</div>
                            <div className="text-xs text-slate-400">中堅企業</div>
                        </div>
                    </Label>

                    <Label
                        htmlFor="over_300m"
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${context.counterpartyCapital === "over_300m"
                            ? "border-slate-400 bg-white shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                    >
                        <RadioGroupItem value="over_300m" id="over_300m" className="sr-only" />
                        <div>
                            <div className="font-medium text-slate-800">3億円超</div>
                            <div className="text-xs text-slate-400">大企業（下請法が適用される可能性）</div>
                        </div>
                    </Label>
                </RadioGroup>
            )}

            {/* Actions */}
            <div className="mt-10 space-y-3">
                <Button
                    onClick={handleNext}
                    className="w-full h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white border-0"
                >
                    {step < 3 ? "次へ" : "チェック開始"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
                    >
                        戻る
                    </button>
                )}
            </div>
        </div>
    );
}
