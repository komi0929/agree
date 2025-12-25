"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserContext, UserEntityType, CapitalRange, ContractType, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
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

    return (
        <Card className="w-full max-w-lg mx-auto border-slate-200 shadow-lg">
            <CardHeader className="text-center pb-4">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`w-2 h-2 rounded-full transition-colors ${s === step ? "bg-slate-900" : s < step ? "bg-slate-400" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>
                <CardTitle className="text-xl">
                    {step === 1 && "あなたの立場を教えてください"}
                    {step === 2 && "あなたの事業形態は？"}
                    {step === 3 && "相手方について"}
                </CardTitle>
                <CardDescription>
                    {step === 1 && "契約書のどちら側として確認しますか？"}
                    {step === 2 && "適用される法律を判定するために必要です"}
                    {step === 3 && "資本金によって適用法規が変わります"}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {step === 1 && (
                    <RadioGroup
                        value={context.userRole}
                        onValueChange={(v) => updateContext({ userRole: v as "vendor" | "client" })}
                        className="grid grid-cols-2 gap-4"
                    >
                        <Label
                            htmlFor="vendor"
                            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${context.userRole === "vendor"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                            <User className="w-8 h-8 text-slate-600" />
                            <div className="text-center">
                                <div className="font-bold text-slate-900">受注者</div>
                                <div className="text-xs text-slate-500 mt-1">仕事を請ける側</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="client"
                            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${context.userRole === "client"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="client" id="client" className="sr-only" />
                            <Building2 className="w-8 h-8 text-slate-600" />
                            <div className="text-center">
                                <div className="font-bold text-slate-900">発注者</div>
                                <div className="text-xs text-slate-500 mt-1">仕事を依頼する側</div>
                            </div>
                        </Label>
                    </RadioGroup>
                )}

                {step === 2 && (
                    <RadioGroup
                        value={context.userEntityType}
                        onValueChange={(v) => updateContext({ userEntityType: v as UserEntityType })}
                        className="space-y-3"
                    >
                        <Label
                            htmlFor="individual"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.userEntityType === "individual"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="individual" id="individual" className="sr-only" />
                            <User className="w-6 h-6 text-slate-600" />
                            <div>
                                <div className="font-bold text-slate-900">個人事業主 / フリーランス</div>
                                <div className="text-xs text-slate-500">開業届を出している個人</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="one_person_corp"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.userEntityType === "one_person_corp"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="one_person_corp" id="one_person_corp" className="sr-only" />
                            <Building2 className="w-6 h-6 text-slate-600" />
                            <div>
                                <div className="font-bold text-slate-900">一人法人（従業員なし）</div>
                                <div className="text-xs text-slate-500">法人化しているが従業員はいない</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="corp_with_employees"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.userEntityType === "corp_with_employees"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="corp_with_employees" id="corp_with_employees" className="sr-only" />
                            <Users className="w-6 h-6 text-slate-600" />
                            <div>
                                <div className="font-bold text-slate-900">従業員がいる法人</div>
                                <div className="text-xs text-slate-500">1名以上の従業員を雇用</div>
                            </div>
                        </Label>
                    </RadioGroup>
                )}

                {step === 3 && (
                    <RadioGroup
                        value={context.counterpartyCapital}
                        onValueChange={(v) => updateContext({ counterpartyCapital: v as CapitalRange | "unknown" })}
                        className="space-y-3"
                    >
                        <Label
                            htmlFor="unknown"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.counterpartyCapital === "unknown"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="unknown" id="unknown" className="sr-only" />
                            <HelpCircle className="w-6 h-6 text-slate-600" />
                            <div>
                                <div className="font-bold text-slate-900">わからない / 未確認</div>
                                <div className="text-xs text-slate-500">最も保守的な判定を行います</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="under_10m"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.counterpartyCapital === "under_10m"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="under_10m" id="under_10m" className="sr-only" />
                            <div>
                                <div className="font-bold text-slate-900">1,000万円以下</div>
                                <div className="text-xs text-slate-500">スタートアップ・中小企業</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="10m_to_300m"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.counterpartyCapital === "10m_to_300m"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="10m_to_300m" id="10m_to_300m" className="sr-only" />
                            <div>
                                <div className="font-bold text-slate-900">1,000万円超〜3億円</div>
                                <div className="text-xs text-slate-500">中堅企業</div>
                            </div>
                        </Label>

                        <Label
                            htmlFor="over_300m"
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${context.counterpartyCapital === "over_300m"
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <RadioGroupItem value="over_300m" id="over_300m" className="sr-only" />
                            <div>
                                <div className="font-bold text-slate-900">3億円超</div>
                                <div className="text-xs text-slate-500">大企業（下請法が適用される可能性）</div>
                            </div>
                        </Label>
                    </RadioGroup>
                )}

                <Button
                    onClick={handleNext}
                    className="w-full h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                    {step < 3 ? "次へ" : "解析を開始"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {step > 1 && (
                    <Button
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        className="w-full text-slate-500"
                    >
                        戻る
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
