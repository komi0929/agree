// lib/rules/payment-calculator.ts
// 60日ルール計算ロジック
//
// [精度向上ログ: 2024-12-25]
// 意図: 60日ルールの計算をLLMに任せず、プログラムで厳密に行う
// 設計判断: 起算点は「納品日」（法律通り）、検収日起算は違法リスクとして警告

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface PaymentTermAnalysis {
    detected: boolean;
    pattern: string | null;
    deliveryToPaymentDays: number | null;
    acceptanceToPaymentDays: number | null;
    includesAcceptancePeriod: boolean;
    estimatedAcceptancePeriod: number | null;
    violates60DayRule: boolean;
    riskLevel: RiskLevel;
    explanation: string;
    details: string;
    matchedText?: string;
}

interface PaymentPattern {
    pattern: RegExp;
    name: string;
    calculate: (match: RegExpMatchArray) => Omit<PaymentTermAnalysis, "detected" | "pattern" | "matchedText">;
}

/**
 * 支払パターンの定義と計算ロジック
 */
const PAYMENT_PATTERNS: PaymentPattern[] = [
    // パターン1: 「納品後◯日以内」
    {
        pattern: /納品.*?(\d+)日.*?(?:以内|まで)/,
        name: "納品後日数指定",
        calculate: (match) => {
            const days = parseInt(match[1]);
            return {
                deliveryToPaymentDays: days,
                acceptanceToPaymentDays: null,
                includesAcceptancePeriod: false,
                estimatedAcceptancePeriod: null,
                violates60DayRule: days > 60,
                riskLevel: days > 60 ? "critical" : days > 45 ? "medium" : "low",
                explanation: `納品から${days}日以内の支払い`,
                details: days > 60
                    ? `${days}日は60日を超過しており、フリーランス新法第4条に違反する可能性があります。`
                    : `${days}日は60日以内であり、フリーランス新法の要件を満たしています。`,
            };
        },
    },

    // パターン2: 「検収後◯日以内」
    {
        pattern: /検収.*?(\d+)日.*?(?:以内|まで)/,
        name: "検収後日数指定",
        calculate: (match) => {
            const acceptanceDays = parseInt(match[1]);
            // 検収期間は通常10-30日、中央値20日と推定
            const estimatedAcceptancePeriod = 20;
            const totalDays = acceptanceDays + estimatedAcceptancePeriod;
            const violates = totalDays > 60;

            return {
                deliveryToPaymentDays: totalDays,
                acceptanceToPaymentDays: acceptanceDays,
                includesAcceptancePeriod: true,
                estimatedAcceptancePeriod,
                violates60DayRule: violates,
                riskLevel: violates ? "high" : acceptanceDays > 30 ? "medium" : "low",
                explanation: `検収から${acceptanceDays}日以内の支払い（起算点に注意）`,
                details: `フリーランス新法では「納品日」が起算点です。検収期間（推定${estimatedAcceptancePeriod}日）を加えると実質${totalDays}日となり、${violates ? "60日を超過する可能性があります" : "ギリギリ60日以内です"}。`,
            };
        },
    },

    // パターン3: 「翌月末」
    {
        pattern: /(?:納品|完了|受領).*?翌月末|翌月末.*?(?:支払|払い)/,
        name: "翌月末払い",
        calculate: () => {
            // 最悪ケース: 月初納品 → 翌月末 = 約60日
            // 最良ケース: 月末納品 → 翌月末 = 約30日
            return {
                deliveryToPaymentDays: 45, // 平均
                acceptanceToPaymentDays: null,
                includesAcceptancePeriod: false,
                estimatedAcceptancePeriod: null,
                violates60DayRule: false, // ギリギリセーフの可能性
                riskLevel: "medium",
                explanation: "翌月末払い",
                details: "翌月末払いは、納品日によっては60日ギリギリになります。月初に納品した場合は約60日、月末納品なら約30日です。",
            };
        },
    },

    // パターン4: 「検収の翌月末」
    {
        pattern: /検収.*?翌月末|翌月末.*?検収/,
        name: "検収翌月末払い",
        calculate: () => {
            // 検収期間20日 + 最悪60日 = 80日
            return {
                deliveryToPaymentDays: 65, // 概算
                acceptanceToPaymentDays: 45,
                includesAcceptancePeriod: true,
                estimatedAcceptancePeriod: 20,
                violates60DayRule: true,
                riskLevel: "high",
                explanation: "検収完了の翌月末払い",
                details: "検収期間を含めると60日を超過する可能性が高いです。「納品日の翌月末」への修正を交渉してください。",
            };
        },
    },

    // パターン5: 「翌々月末」
    {
        pattern: /翌々月末/,
        name: "翌々月末払い",
        calculate: () => {
            return {
                deliveryToPaymentDays: 75, // 概算
                acceptanceToPaymentDays: null,
                includesAcceptancePeriod: false,
                estimatedAcceptancePeriod: null,
                violates60DayRule: true,
                riskLevel: "critical",
                explanation: "翌々月末払い",
                details: "翌々月末払いは、最短でも約60日、最長で約90日かかり、フリーランス新法第4条に違反する可能性が極めて高いです。",
            };
        },
    },

    // パターン6: 「◯日後」「◯日」
    {
        pattern: /(\d+)日(?:後|以内|まで).*?(?:支払|払い)|(?:支払|払い).*?(\d+)日/,
        name: "日数指定",
        calculate: (match) => {
            const days = parseInt(match[1] || match[2]);
            const violates = days > 60;
            return {
                deliveryToPaymentDays: days,
                acceptanceToPaymentDays: null,
                includesAcceptancePeriod: false,
                estimatedAcceptancePeriod: null,
                violates60DayRule: violates,
                riskLevel: violates ? "critical" : days > 45 ? "medium" : "low",
                explanation: `${days}日以内の支払い`,
                details: violates
                    ? `${days}日は60日を超過しており、法令違反の可能性があります。`
                    : `${days}日は60日以内です。`,
            };
        },
    },
];

/**
 * 契約書テキストから支払条件を解析
 * 
 * @param text 契約書のテキスト
 * @returns 支払条件の解析結果
 */
export function analyzePaymentTerms(text: string): PaymentTermAnalysis {
    for (const paymentPattern of PAYMENT_PATTERNS) {
        const match = text.match(paymentPattern.pattern);
        if (match) {
            const result = paymentPattern.calculate(match);
            return {
                detected: true,
                pattern: paymentPattern.name,
                matchedText: match[0],
                ...result,
            };
        }
    }

    // パターンにマッチしない場合
    return {
        detected: false,
        pattern: null,
        deliveryToPaymentDays: null,
        acceptanceToPaymentDays: null,
        includesAcceptancePeriod: false,
        estimatedAcceptancePeriod: null,
        violates60DayRule: false,
        riskLevel: "medium",
        explanation: "支払期日のパターンを特定できませんでした",
        details: "支払条件の記載を確認し、納品日から60日以内に支払われるか確認してください。",
    };
}

/**
 * 60日ルール違反かどうかを簡易判定
 */
export function quickCheck60DayRule(text: string): boolean {
    const analysis = analyzePaymentTerms(text);
    return analysis.violates60DayRule;
}
