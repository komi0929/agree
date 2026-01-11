// lib/rules/contract-type-detector.ts
// 契約類型（請負/準委任）の自動判定
//
// [実装: 2026-01-11]
// 意図: 契約書が「請負」か「準委任」かを自動判定し、適切なリスク評価を行う
// 設計判断: キーワードベースでスコアリングし、どちらに近いかを判定

export type ContractType = "請負" | "準委任" | "混合" | "不明";

export interface ContractTypeIndicator {
    type: "請負" | "準委任";
    pattern: RegExp;
    weight: number;  // 影響度（1-3）
    description: string;
}

/**
 * 契約類型を示すキーワード・パターン
 */
export const CONTRACT_TYPE_INDICATORS: ContractTypeIndicator[] = [
    // 請負を示すパターン
    {
        type: "請負",
        pattern: /(?:成果物|納品物).*(?:完成|納品)/,
        weight: 3,
        description: "成果物の完成・納品を義務とする",
    },
    {
        type: "請負",
        pattern: /仕事の完成/,
        weight: 3,
        description: "「仕事の完成」という請負の本質的な文言",
    },
    {
        type: "請負",
        pattern: /検収.*(?:合格|完了).*報酬/,
        weight: 2,
        description: "検収合格を報酬支払いの条件とする",
    },
    {
        type: "請負",
        pattern: /契約不適合|瑕疵担保/,
        weight: 2,
        description: "契約不適合責任（請負特有の責任）の規定がある",
    },
    {
        type: "請負",
        pattern: /(?:完成|納品).*(?:をもって|により).*(?:終了|完了)/,
        weight: 2,
        description: "成果物の完成・納品で契約が終了する",
    },
    {
        type: "請負",
        pattern: /請負/,
        weight: 3,
        description: "「請負」という明示的な記載",
    },

    // 準委任を示すパターン
    {
        type: "準委任",
        pattern: /(?:事務|業務).*(?:処理|遂行)/,
        weight: 2,
        description: "事務・業務の処理を目的とする",
    },
    {
        type: "準委任",
        pattern: /善管注意義務|善良な管理者/,
        weight: 3,
        description: "善管注意義務（準委任特有の義務）の規定がある",
    },
    {
        type: "準委任",
        pattern: /(?:役務|サービス).*(?:提供|遂行)/,
        weight: 2,
        description: "役務の提供を目的とする",
    },
    {
        type: "準委任",
        pattern: /(?:月額|時間).*(?:報酬|対価)/,
        weight: 2,
        description: "時間ベースの報酬体系（成果物ではなくプロセスへの対価）",
    },
    {
        type: "準委任",
        pattern: /(?:準委任|委任)/,
        weight: 3,
        description: "「準委任」または「委任」という明示的な記載",
    },
    {
        type: "準委任",
        pattern: /(?:いつでも|随時).*(?:解約|解除)/,
        weight: 1,
        description: "いつでも解約可能（準委任の特徴）",
    },
    {
        type: "準委任",
        pattern: /コンサルティング|アドバイザリー|顧問/,
        weight: 2,
        description: "コンサルティング・顧問業務（典型的な準委任）",
    },
];

export interface ContractTypeResult {
    detected_type: ContractType;
    confidence: "high" | "medium" | "low";
    scores: {
        ukeoi: number;      // 請負スコア
        jun_inin: number;   // 準委任スコア
    };
    indicators: Array<{
        indicator: ContractTypeIndicator;
        matched_text: string;
    }>;
    explanation: string;
    recommendation: string;
}

/**
 * 契約類型を判定
 */
export function detectContractType(text: string): ContractTypeResult {
    let ukeoiScore = 0;
    let junIninScore = 0;
    const matchedIndicators: ContractTypeResult["indicators"] = [];

    for (const indicator of CONTRACT_TYPE_INDICATORS) {
        const match = text.match(indicator.pattern);
        if (match) {
            if (indicator.type === "請負") {
                ukeoiScore += indicator.weight;
            } else {
                junIninScore += indicator.weight;
            }

            matchedIndicators.push({
                indicator,
                matched_text: match[0],
            });
        }
    }

    // 判定
    let detectedType: ContractType;
    let confidence: ContractTypeResult["confidence"];
    let explanation: string;
    let recommendation: string;

    const totalScore = ukeoiScore + junIninScore;
    const scoreDiff = Math.abs(ukeoiScore - junIninScore);

    if (totalScore === 0) {
        detectedType = "不明";
        confidence = "low";
        explanation = "契約類型を判断するための明確な条項が見つかりませんでした。";
        recommendation = "「本契約は請負契約とする」または「本契約は準委任契約とする」を明記することをお勧めします。";
    } else if (scoreDiff <= 2) {
        detectedType = "混合";
        confidence = "medium";
        explanation = `請負と準委任の両方の特徴が見られます（請負スコア: ${ukeoiScore}, 準委任スコア: ${junIninScore}）。`;
        recommendation = "契約類型が曖昧な場合、トラブル時の責任範囲が不明確になります。どちらかを明記するか、業務内容に応じて条項を調整してください。";
    } else if (ukeoiScore > junIninScore) {
        detectedType = "請負";
        confidence = scoreDiff >= 5 ? "high" : "medium";
        explanation = `この契約は**請負契約**の特徴が強いです（請負スコア: ${ukeoiScore}, 準委任スコア: ${junIninScore}）。成果物の完成義務を負い、契約不適合責任のリスクがあります。`;
        recommendation = "請負契約では「完成責任」を負います。修正回数や検収条件を明確にし、無限の修正対応を避けてください。";
    } else {
        detectedType = "準委任";
        confidence = scoreDiff >= 5 ? "high" : "medium";
        explanation = `この契約は**準委任契約**の特徴が強いです（請負スコア: ${ukeoiScore}, 準委任スコア: ${junIninScore}）。プロセス（業務遂行）に対する対価であり、完成責任は負いません。`;
        recommendation = "準委任契約では「善管注意義務」を負います。プロとして期待される水準で業務を遂行すれば、結果に対する責任は問われません。";
    }

    return {
        detected_type: detectedType,
        confidence,
        scores: {
            ukeoi: ukeoiScore,
            jun_inin: junIninScore,
        },
        indicators: matchedIndicators,
        explanation,
        recommendation,
    };
}

/**
 * 簡易判定（型のみ返す）
 */
export function getContractType(text: string): ContractType {
    return detectContractType(text).detected_type;
}
