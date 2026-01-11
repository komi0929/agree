// lib/rules/recommended-clauses.ts
// 追加推奨条項の定義
//
// [精度向上ログ: 2024-12-25]
// 意図: 契約書に「追加すべき」保護条項の欠落を検知し、追加を提案する
// 設計判断: 28チェックポイントの項目12-28に対応
// これらは「危険」ではなく「あると良い」条項なので、リスクレベルは medium/low

import { ClauseTag } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface RecommendedClause {
    id: string;
    item_no: number;  // 28チェックポイントの項目番号
    name: string;
    tag: ClauseTag;
    detection_patterns: RegExp[];  // これがあれば条項ありと判定
    missing_risk: RiskLevel;
    missing_title: string;
    missing_message: string;
    recommended_text: string;  // 追加を推奨する条文例
    benefit: string;  // 追加のメリット
}

/**
 * 追加推奨条項の定義（28チェックポイント項目12-28）
 */
export const RECOMMENDED_CLAUSES: RecommendedClause[] = [
    // ========================================
    // 項目12: みなし検収
    // ========================================
    {
        id: "recommend_012",
        item_no: 12,
        name: "みなし検収",
        tag: "CLAUSE_ACCEPTANCE",
        detection_patterns: [
            /みなし検収/,
            /異議.*ない.*(?:場合|とき).*検収/,
            /日.*以内.*異議.*ない.*合格/,
        ],
        missing_risk: "high",
        missing_title: "みなし検収条項がありません（最重要）",
        missing_message: "みなし検収の規定がありません。クライアントが確認を放置して支払いが遅れるリスクがあります。",
        recommended_text: "納品後10日以内に甲から異議がない場合は、検収に合格したものとみなす。",
        benefit: "クライアントの確認放置による未払いを防ぐ（最重要）",
    },

    // ========================================
    // 項目13: 遅延利息
    // ========================================
    {
        id: "recommend_013",
        item_no: 13,
        name: "遅延利息",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /遅延損害金/,
            /遅延利息/,
            /支払.*遅れ.*年率/,
        ],
        missing_risk: "medium",
        missing_title: "遅延利息の規定がありません",
        missing_message: "支払遅延時の遅延利息に関する規定がありません。支払遅延への抑止力がありません。",
        recommended_text: "甲が支払いを遅延した場合、年率14.6%の遅延損害金を支払うものとする。",
        benefit: "支払遅延への強力な抑止力になる",
    },

    // ========================================
    // 項目14: 消費税明記
    // ========================================
    {
        id: "recommend_014",
        item_no: 14,
        name: "消費税明記",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /消費税.*(?:別途|別|除く)/,
            /税別/,
            /税込/,
            /消費税.*(?:加算|含む)/,
        ],
        missing_risk: "medium",
        missing_title: "消費税の取り扱いが明記されていません",
        missing_message: "契約金額が税込か税別か明確ではありません。10%の損失リスクがあります。",
        recommended_text: "契約金額は税別表示であり、消費税は別途申し受ける。",
        benefit: "税込・税別の認識齟齬による10%の損失を防ぐ",
    },

    // ========================================
    // 項目15: 経費負担
    // ========================================
    {
        id: "recommend_015",
        item_no: 15,
        name: "経費負担",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /経費.*(?:甲|発注者).*負担/,
            /実費.*(?:負担|精算)/,
            /旅費.*(?:負担|精算)/,
        ],
        missing_risk: "medium",
        missing_title: "経費負担の規定がありません",
        missing_message: "業務遂行に必要な経費（旅費・素材費等）の負担者が明記されていません。持ち出しのリスクがあります。",
        recommended_text: "業務遂行に必要な実費（旅費・素材費等）は甲が負担する。",
        benefit: "持ち出し（赤字）を防ぐ",
    },

    // ========================================
    // 項目16: 着手金
    // ========================================
    {
        id: "recommend_016",
        item_no: 16,
        name: "着手金",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /着手金/,
            /前金/,
            /契約時.*(?:一部|%|パーセント).*支払/,
        ],
        missing_risk: "low",
        missing_title: "着手金の規定がありません",
        missing_message: "着手金に関する規定がありません。長期案件では資金繰りが厳しくなる可能性があります。",
        recommended_text: "契約時に報酬の30%を着手金として支払う。",
        benefit: "長期案件での資金繰り悪化を防ぐ",
    },

    // ========================================
    // 項目17: 中途解約精算
    // ========================================
    {
        id: "recommend_017",
        item_no: 17,
        name: "中途解約精算",
        tag: "CLAUSE_TERMINATION",
        detection_patterns: [
            /解約.*(?:精算|清算)/,
            /解除.*作業.*(?:報酬|対価)/,
            /履行.*割合.*支払/,
        ],
        missing_risk: "high",
        missing_title: "中途解約時の精算規定がありません",
        missing_message: "プロジェクトが途中で終了した場合の精算方法が明記されていません。タダ働きのリスクがあります。",
        recommended_text: "解約時は、履行割合に関わらず、乙が遂行した作業工数×単価を支払うものとする。",
        benefit: "プロジェクト頓挫時のタダ働きを防ぐ",
    },

    // ========================================
    // 項目18: 物価・仕様変更対応
    // ========================================
    {
        id: "recommend_018",
        item_no: 18,
        name: "物価・仕様変更対応",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /物価.*(?:変動|改定)/,
            /仕様.*変更.*(?:協議|改定)/,
            /報酬.*(?:見直し|改定).*(?:協議|できる)/,
        ],
        missing_risk: "low",
        missing_title: "報酬改定の規定がありません",
        missing_message: "物価変動や仕様変更時の報酬改定に関する規定がありません。インフレや要件肥大化に対応できない可能性があります。",
        recommended_text: "物価変動や仕様変更時は、協議の上、報酬額を改定できるものとする。",
        benefit: "インフレや要件肥大化に対応する余地を残す",
    },

    // ========================================
    // 項目19: 履行遅滞免責
    // ========================================
    {
        id: "recommend_019",
        item_no: 19,
        name: "履行遅滞免責",
        tag: "CLAUSE_SCOPE",
        detection_patterns: [
            /甲.*(?:遅れ|遅延).*乙.*責任.*(?:ない|負わない)/,
            /資料.*(?:遅れ|遅延).*免責/,
            /納期.*(?:延長|延期)/,
        ],
        missing_risk: "medium",
        missing_title: "履行遅滞免責の規定がありません",
        missing_message: "クライアント側の遅れ（資料提供遅延等）による納期遅延の免責規定がありません。クライアント起因の遅れでペナルティを受けるリスクがあります。",
        recommended_text: "甲の資料提供遅れ等による納期遅延は、乙の責任としない。",
        benefit: "クライアント起因の遅れでペナルティを受けないようにする",
    },

    // ========================================
    // 項目20: AIツール利用許可
    // ========================================
    {
        id: "recommend_020",
        item_no: 20,
        name: "AIツール利用許可",
        tag: "CLAUSE_SCOPE",
        detection_patterns: [
            /(?:AI|生成AI).*(?:利用|使用).*(?:できる|可)/,
            /ツール.*(?:利用|使用).*裁量/,
        ],
        missing_risk: "low",
        missing_title: "AIツール利用に関する規定がありません",
        missing_message: "業務でのAIツール利用に関する規定がありません。AI活用が契約違反と主張されるリスクがあります。",
        recommended_text: "乙は業務遂行の補助として生成AIを利用できるものとする。",
        benefit: "AI活用による効率化を契約違反と言わせない",
    },

    // ========================================
    // 項目21: 背景IP留保
    // ========================================
    {
        id: "recommend_021",
        item_no: 21,
        name: "背景IP留保",
        tag: "CLAUSE_IP",
        detection_patterns: [
            /従前.*(?:保有|所有).*(?:権利|IP)/,
            /既存.*(?:コード|ライブラリ).*(?:留保|帰属)/,
            /背景IP/,
            /乙.*(?:汎用|既存).*(?:留保|権利)/,
        ],
        missing_risk: "medium",
        missing_title: "背景IP留保の規定がありません",
        missing_message: "あなたが従前より保有するコードやノウハウの権利留保に関する規定がありません。自分のライブラリを他の案件で使い回せなくなるリスクがあります。",
        recommended_text: "乙が従前より保有する汎用コード、ツール、ノウハウ等の権利は乙に留保されるものとする。",
        benefit: "自分のライブラリやノウハウの使い回し権を確保する",
    },

    // ========================================
    // 項目22: 実績公開権
    // ========================================
    {
        id: "recommend_022",
        item_no: 22,
        name: "実績公開権",
        tag: "CLAUSE_IP",
        detection_patterns: [
            /実績.*(?:公開|Web|ウェブ)/,
            /ポートフォリオ/,
            /制作実績/,
        ],
        missing_risk: "low",
        missing_title: "実績公開権の規定がありません",
        missing_message: "成果物を制作実績として公開する権利に関する規定がありません。ポートフォリオとして使えなくなる可能性があります。",
        recommended_text: "乙は成果物を制作実績としてWeb等で公開できるものとする。",
        benefit: "ポートフォリオとして営業ツールに利用できる",
    },

    // ========================================
    // 項目23: クレジット表記
    // ========================================
    {
        id: "recommend_023",
        item_no: 23,
        name: "クレジット表記",
        tag: "CLAUSE_IP",
        detection_patterns: [
            /クレジット/,
            /著作者名.*表示/,
            /氏名.*表示/,
        ],
        missing_risk: "low",
        missing_title: "クレジット表記の規定がありません",
        missing_message: "成果物への著作者名表示（クレジット表記）に関する規定がありません。",
        recommended_text: "乙は成果物に著作者名を表示することができるものとする。",
        benefit: "知名度向上、ブランディングに繋がる",
    },

    // ========================================
    // 項目24: 引き抜き禁止
    // ========================================
    {
        id: "recommend_024",
        item_no: 24,
        name: "引き抜き禁止",
        tag: "CLAUSE_OTHER",
        detection_patterns: [
            /引き抜き.*禁止/,
            /勧誘.*禁止/,
            /直接.*(?:契約|勧誘).*禁止/,
        ],
        missing_risk: "low",
        missing_title: "引き抜き禁止の規定がありません",
        missing_message: "あなたのチームメンバーや再委託先への直接勧誘を禁止する規定がありません。中抜きされるリスクがあります。",
        recommended_text: "甲は乙の従業員・再委託先に対して、直接勧誘・契約締結を行ってはならない。",
        benefit: "チームメンバーの中抜き（直接契約）を防ぐ",
    },

    // ========================================
    // 項目25: 連絡対応時間
    // ========================================
    {
        id: "recommend_025",
        item_no: 25,
        name: "連絡対応時間",
        tag: "CLAUSE_SCOPE",
        detection_patterns: [
            /(?:連絡|対応).*時間/,
            /営業時間/,
            /対応可能.*時間/,
        ],
        missing_risk: "low",
        missing_title: "連絡対応時間の規定がありません",
        missing_message: "連絡対応時間に関する規定がありません。深夜や休日の対応を求められるリスクがあります。",
        recommended_text: "乙の連絡対応時間は平日10時〜18時とする。",
        benefit: "深夜休日の対応強要を防ぐ",
    },

    // ========================================
    // 項目26: ハラスメント解除
    // ========================================
    {
        id: "recommend_026",
        item_no: 26,
        name: "ハラスメント解除",
        tag: "CLAUSE_TERMINATION",
        detection_patterns: [
            /ハラスメント.*解除/,
            /信頼.*維持.*困難.*解除/,
            /乙.*即時.*解除/,
        ],
        missing_risk: "low",
        missing_title: "ハラスメント時の解除規定がありません",
        missing_message: "クライアントのハラスメント等で信頼維持が困難な場合の即時解除規定がありません。",
        recommended_text: "甲のハラスメント等により信頼関係の維持が困難な場合、乙は即時に本契約を解除できるものとする。",
        benefit: "悪質なクライアントから即座に逃げる権利を確保する",
    },

    // ========================================
    // 項目27: 特急料金
    // ========================================
    {
        id: "recommend_027",
        item_no: 27,
        name: "特急料金",
        tag: "CLAUSE_PAYMENT",
        detection_patterns: [
            /特急料金/,
            /割増料金/,
            /短納期.*(?:割増|追加)/,
        ],
        missing_risk: "low",
        missing_title: "特急料金の規定がありません",
        missing_message: "通常より短い納期での依頼に対する割増料金の規定がありません。",
        recommended_text: "通常納期より短い依頼については、50%の割増料金を申し受ける。",
        benefit: "無茶な短納期依頼を抑制、または収益化する",
    },

    // ========================================
    // 項目28: 自動更新
    // ========================================
    {
        id: "recommend_028",
        item_no: 28,
        name: "自動更新",
        tag: "CLAUSE_TERM",
        detection_patterns: [
            /自動.*更新/,
            /期間満了.*(?:通知|申し出).*(?:ない|なき).*(?:継続|更新)/,
        ],
        missing_risk: "low",
        missing_title: "自動更新の規定がありません",
        missing_message: "契約の自動更新に関する規定がありません。継続案件の場合、更新の都度契約交渉が必要になります。",
        recommended_text: "期間満了1ヶ月前までに書面による通知がなければ、同条件で1年間自動更新されるものとする。",
        benefit: "継続案件の契約更新の手間を省く",
    },

    // ========================================
    // 追加項目29: 二次利用料（IMP-B1）
    // ========================================
    {
        id: "recommend_029",
        item_no: 29,
        name: "二次利用料",
        tag: "CLAUSE_IP",
        detection_patterns: [
            /二次利用.*(?:協議|追加|別途)/,
            /(?:追加|別途).*(?:利用|使用).*(?:協議|対価)/,
            /(?:当初|本契約).*目的.*以外.*(?:協議|追加)/,
        ],
        missing_risk: "medium",
        missing_title: "二次利用に関する規定がありません",
        missing_message: "成果物の二次利用（当初の目的以外での利用）に対する対価規定がありません。無断で広告やグッズに転用されるリスクがあります。",
        recommended_text: "当初の目的以外で成果物を利用する場合は、乙と協議の上、別途利用料を支払うものとする。",
        benefit: "成果物の二次利用による追加収益を確保する",
    },

    // ========================================
    // 追加項目30: 追加作業の別途見積もり（IMP-B2）
    // ========================================
    {
        id: "recommend_030",
        item_no: 30,
        name: "追加作業の別途見積もり",
        tag: "CLAUSE_SCOPE",
        detection_patterns: [
            /追加.*(?:作業|業務).*(?:見積|協議|別途)/,
            /仕様.*変更.*(?:追加|別途|協議)/,
            /範囲.*外.*(?:見積|協議|追加)/,
        ],
        missing_risk: "medium",
        missing_title: "追加作業に関する規定がありません",
        missing_message: "当初の業務範囲外の追加作業に対する報酬規定がありません。スコープクリープ（業務範囲の際限ない拡大）によるタダ働きリスクがあります。",
        recommended_text: "当初の仕様書に含まれない追加作業が発生した場合は、別途見積もりの上、追加報酬を支払うものとする。",
        benefit: "タダ働き（スコープクリープ）を防止する",
    },
];

/**
 * テキストに対して推奨条項の有無をチェック
 * @returns 欠落している推奨条項のリスト
 */
export function checkRecommendedClauses(text: string): RecommendedClause[] {
    const missing: RecommendedClause[] = [];

    for (const clause of RECOMMENDED_CLAUSES) {
        // いずれかのパターンにマッチすれば存在と判定
        const exists = clause.detection_patterns.some(pattern => pattern.test(text));

        if (!exists) {
            missing.push(clause);
        }
    }

    return missing;
}

/**
 * 重要度順に推奨条項を取得
 */
export function getRecommendedClausesByPriority(): RecommendedClause[] {
    const riskOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };
    return [...RECOMMENDED_CLAUSES].sort((a, b) =>
        riskOrder[a.missing_risk] - riskOrder[b.missing_risk]
    );
}
