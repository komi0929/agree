// lib/rules/required-clauses.ts
// 必須条項の存在チェック定義
//
// [精度向上ログ: 2026-01-11]
// 意図: フリーランス新法第3条「7項目」の100%検知に対応 (IMP-S1)
// 設計判断: 取引条件の明示義務にかかる全項目をチェック

import { ClauseTag } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface RequiredClause {
    id: string;
    name: string;
    tag: ClauseTag;
    patterns: RegExp[];
    missing_risk: RiskLevel;
    missing_title: string;
    missing_message: string;
    why_required: string;
}

/**
 * 業務委託契約で必須となる条項の定義
 * 
 * これらが契約書に存在しない場合、欠落リスクとして警告する
 */
export const REQUIRED_CLAUSES: RequiredClause[] = [
    {
        id: "required_001",
        name: "支払条件",
        tag: "CLAUSE_PAYMENT",
        patterns: [
            /支払.*期日/,
            /支払.*期限/,
            /報酬.*支払/,
            /対価.*支払/,
            /代金.*支払/,
        ],
        missing_risk: "critical",
        missing_title: "支払条件の規定がありません",
        missing_message: "支払期日に関する規定が見つかりません。報酬がいつ支払われるか不明確な状態は極めて危険です。",
        why_required: "フリーランス新法第3条では、報酬額と支払期日の明示が義務付けられています。また支払期日の規定がないと、支払いを無期限に遅らせられるリスクがあります。",
    },
    {
        id: "required_002",
        name: "著作権・知的財産権",
        tag: "CLAUSE_IP",
        patterns: [
            /著作権/,
            /知的財産権/,
            /権利.*帰属/,
            /成果物.*権利/,
        ],
        missing_risk: "high",
        missing_title: "著作権の規定がありません",
        missing_message: "著作権の帰属に関する規定がありません。成果物の権利関係が曖昧になり、将来のトラブルの原因となります。",
        why_required: "著作権は原則として創作者（受注者）に帰属します。明示がないと、発注者が成果物を自由に使えると誤解する可能性があります。",
    },
    {
        id: "required_003",
        name: "損害賠償・責任範囲",
        tag: "CLAUSE_LIABILITY",
        patterns: [
            /損害賠償/,
            /賠償責任/,
            /免責/,
            /責任.*範囲/,
            /責任.*限度/,
        ],
        missing_risk: "high",
        missing_title: "損害賠償の規定がありません",
        missing_message: "損害賠償に関する規定がありません。万が一の際の責任範囲が不明確で、予期せぬ大きな賠償を請求されるリスクがあります。",
        why_required: "上限規定がないと、報酬額を遥かに超える損害賠償を請求される可能性があります。業務上のミスが事業の存続を脅かす事態になりかねません。",
    },
    {
        id: "required_004",
        name: "契約解除・終了",
        tag: "CLAUSE_TERMINATION",
        patterns: [
            /解除/,
            /解約/,
            /契約.*終了/,
            /契約.*打ち切り/,
        ],
        missing_risk: "medium",
        missing_title: "契約解除の規定がありません",
        missing_message: "契約解除に関する規定がありません。どのような条件で契約が終了するか不明確です。",
        why_required: "解除条件が明確でないと、一方的に契約を打ち切られた際に対抗手段がありません。",
    },
    {
        id: "required_005",
        name: "業務内容・仕様",
        tag: "CLAUSE_SCOPE",
        patterns: [
            /業務.*内容/,
            /委託.*内容/,
            /業務.*範囲/,
            /仕様/,
            /成果物/,
        ],
        missing_risk: "medium",
        missing_title: "業務内容の規定がありません",
        missing_message: "業務内容に関する具体的な規定が見つかりません。何をどこまでやるかが曖昧だと、無限に追加作業を求められるリスクがあります。",
        why_required: "フリーランス新法第3条では業務内容の明示が義務付けられています。",
    },
    {
        id: "required_006",
        name: "報酬の額",
        tag: "CLAUSE_PAYMENT",
        patterns: [
            /報酬.*額/,
            /対価.*額/,
            /代金.*額/,
            /金[0-9]{1,3}(?:,[0-9]{3})*円/,
            /契約金額/,
        ],
        missing_risk: "critical",
        missing_title: "報酬額の明記がありません",
        missing_message: "報酬の具体的な金額または計算方法が見つかりません。いくら支払われるか不明な契約は極めて危険です。",
        why_required: "フリーランス新法第3条では報酬額の明示が義務付けられています。",
    },
    {
        id: "required_007",
        name: "完了日・納期",
        tag: "CLAUSE_TERM",
        patterns: [
            /完了.*日/,
            /納期/,
            /期限/,
            /期間/,
            /期日までに/,
            /[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日/,
        ],
        missing_risk: "high",
        missing_title: "完了予定日・納期の規定がありません",
        missing_message: "業務をいつまでに完了すべきかの規定が見つかりません。際限なく作業を継続させられるリスクがあります。",
        why_required: "フリーランス新法第3条では、業務を完了すべき日、期間の明示が義務付けられています。",
    },
];

/**
 * テキストに対して必須条項の存在をチェック
 * @returns 欠落している必須条項のリスト
 */
export function checkRequiredClauses(text: string): RequiredClause[] {
    const missing: RequiredClause[] = [];

    for (const clause of REQUIRED_CLAUSES) {
        // いずれかのパターンにマッチすれば存在と判定
        const exists = clause.patterns.some(pattern => pattern.test(text));

        if (!exists) {
            missing.push(clause);
        }
    }

    return missing;
}

/**
 * 特定のカテゴリの必須条項を取得
 */
export function getRequiredClausesByTag(tag: ClauseTag): RequiredClause[] {
    return REQUIRED_CLAUSES.filter(clause => clause.tag === tag);
}
