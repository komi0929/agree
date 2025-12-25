// lib/knowledge/known-bad-patterns.ts
// 既知の悪質パターンデータベース
//
// [精度向上ログ: 2024-12-25]
// 意図: 実際のトラブル事例やよくある危険条項をデータベース化
// 設計判断: 類似度マッチングではなく、キーワードベースで検知

import { ViolatedLaw } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface KnownBadPattern {
    id: string;
    name: string;
    category: "liability" | "termination" | "copyright" | "payment" | "scope" | "general";
    risk_level: RiskLevel;
    law?: ViolatedLaw;

    // 検知用のキーワード/パターン
    detection_keywords: string[];
    detection_patterns?: RegExp[];

    // 説明と対策
    why_dangerous: string;
    real_world_example?: string;
    recommended_fix: string;
    negotiation_point: string;
}

/**
 * 既知の悪質パターン
 * 
 * これらは実際のトラブル事例や専門家の知見に基づいて定義
 * 新しいパターンを発見したら追加する
 */
export const KNOWN_BAD_PATTERNS: KnownBadPattern[] = [
    // ========================================
    // 損害賠償関連
    // ========================================
    {
        id: "kbp_liability_001",
        name: "無限責任条項",
        category: "liability",
        risk_level: "critical",
        law: "civil_code_conformity",
        detection_keywords: ["一切の損害", "全額賠償", "全ての損害"],
        detection_patterns: [
            /一切の損害.*賠償/,
            /損害.*全額.*負担/,
        ],
        why_dangerous: "損害賠償に上限がないため、報酬額を大幅に超える賠償を請求される可能性があります。例えば50万円の案件で、「システム障害による機会損失」として数千万円を請求されるリスクがあります。",
        real_world_example: "Webサイト制作で納品後にバグが発見され、「サイトダウンによる売上損失」として1000万円を請求された事例があります。",
        recommended_fix: "「乙の損害賠償責任は、本契約に基づき支払われた報酬の総額を上限とする」を追加してください。",
        negotiation_point: "「業界標準として、賠償上限は報酬額の範囲内とするのが一般的です。リスクを適切に分担するため、上限条項の追加をお願いできますでしょうか」",
    },
    {
        id: "kbp_liability_002",
        name: "逸失利益・間接損害の賠償",
        category: "liability",
        risk_level: "high",
        law: "civil_code_conformity",
        detection_keywords: ["逸失利益", "間接損害", "特別損害"],
        why_dangerous: "逸失利益（得られるはずだった利益）や間接損害は、直接損害よりも金額が膨らみやすく、予測不能です。",
        recommended_fix: "「逸失利益、間接損害、特別損害については賠償責任を負わない」を追加してください。",
        negotiation_point: "「直接的な損害については責任を持ちますが、間接的な損害まで負担することは難しい状況です。この点についてご検討いただけますか」",
    },

    // ========================================
    // 契約解除関連
    // ========================================
    {
        id: "kbp_termination_001",
        name: "一方的な即時解除権",
        category: "termination",
        risk_level: "high",
        detection_keywords: ["いつでも解除", "理由の如何を問わず", "任意に解除"],
        detection_patterns: [
            /甲は.*いつでも.*解除/,
            /理由.*問わず.*解除/,
        ],
        why_dangerous: "発注者が一方的に、いつでも契約を打ち切れるため、進行中の作業に対する報酬が保証されません。突然の解除で収入が途絶えるリスクがあります。",
        recommended_fix: "「解除の場合、少なくとも30日前の書面による通知を要する」または「解除時点までの作業に対して報酬を支払う」を追加してください。",
        negotiation_point: "「プロジェクトの計画を立てる必要がありますので、解除の場合は事前通知期間を設けていただけると助かります」",
    },
    {
        id: "kbp_termination_002",
        name: "解除時の報酬不払い",
        category: "termination",
        risk_level: "high",
        detection_keywords: ["解除の場合", "報酬は発生しない", "支払い義務を負わない"],
        detection_patterns: [
            /解除.*報酬.*(?:発生しない|支払わない|不要)/,
        ],
        why_dangerous: "途中まで作業をしていても、解除されると報酬がゼロになります。労働が無駄になるリスクがあります。",
        recommended_fix: "「解除時点までに完了した作業については、合理的な報酬を支払う」を追加してください。",
        negotiation_point: "「解除時点までの作業については、出来高に応じてお支払いいただけるようお願いできますでしょうか」",
    },

    // ========================================
    // 著作権関連
    // ========================================
    {
        id: "kbp_copyright_001",
        name: "著作権の完全譲渡（27/28条未記載）",
        category: "copyright",
        risk_level: "high",
        law: "copyright_art27_28",
        detection_keywords: ["著作権を譲渡", "著作権は甲に帰属"],
        detection_patterns: [
            /著作権.*(?:譲渡|移転|帰属)/,
        ],
        why_dangerous: "著作権法第61条第2項により、「すべての著作権を譲渡」と書いても、第27条（翻案権）と第28条（二次的著作物の利用権）は特掲しないと移転しません。発注者は改変や続編制作ができない可能性があります。",
        recommended_fix: "【発注者向け】「著作権法第27条および第28条に定める権利を含む」を明記。\n【受注者向け】そのままでも構いませんが、対価として適切か確認してください。",
        negotiation_point: "「著作権の移転範囲を明確にするため、27条・28条の記載を追加させていただいてもよろしいでしょうか」",
    },
    {
        id: "kbp_copyright_002",
        name: "著作者人格権の包括的不行使",
        category: "copyright",
        risk_level: "medium",
        law: "copyright_art27_28",
        detection_keywords: ["著作者人格権", "行使しない", "不行使"],
        detection_patterns: [
            /著作者人格権.*(?:行使しない|放棄|不行使)/,
        ],
        why_dangerous: "自分の作品が勝手に改変されたり、氏名が表示されなかったりしても文句を言えなくなります。ポートフォリオに掲載できなくなる可能性もあります。",
        recommended_fix: "「但し、乙が自身の制作実績として公開することは妨げない」という一文を追加してください。",
        negotiation_point: "「ポートフォリオへの掲載は認めていただけますでしょうか。実績として公開することで、今後の仕事にも繋がりますので」",
    },

    // ========================================
    // 業務範囲関連
    // ========================================
    {
        id: "kbp_scope_001",
        name: "業務範囲の曖昧な定義",
        category: "scope",
        risk_level: "medium",
        detection_keywords: ["その他関連業務", "付随する業務", "合理的に関連する"],
        detection_patterns: [
            /その他.*関連.*業務/,
            /付随.*業務/,
        ],
        why_dangerous: "「その他関連業務」のような曖昧な定義は、無限に追加作業を求められるリスクがあります。スコープクリープ（業務範囲の際限ない拡大）の原因になります。",
        recommended_fix: "業務内容を具体的に列挙し、「上記以外の業務は別途協議の上、追加報酬を設定する」を追加してください。",
        negotiation_point: "「業務範囲を明確にするため、具体的な作業項目を列挙させていただけますでしょうか。追加作業が発生した場合は別途ご相談させてください」",
    },
    {
        id: "kbp_scope_002",
        name: "無料修正の無制限回数",
        category: "scope",
        risk_level: "medium",
        detection_keywords: ["修正", "回数の制限なく", "何度でも"],
        detection_patterns: [
            /修正.*(?:制限なく|何度でも|無制限)/,
        ],
        why_dangerous: "修正回数に制限がないと、エンドレスで修正を求められる可能性があります。時間あたりの報酬が極端に低くなるリスクがあります。",
        recommended_fix: "「修正は〇回まで。追加修正は1回あたり〇円」を明記してください。",
        negotiation_point: "「品質向上のため修正には対応しますが、回数の目安を設けさせていただけますでしょうか」",
    },

    // ========================================
    // 支払関連
    // ========================================
    {
        id: "kbp_payment_001",
        name: "成果物の品質を理由とした支払拒否",
        category: "payment",
        risk_level: "high",
        law: "freelance_new_law_art5",
        detection_keywords: ["品質が満たない", "基準を満たさない場合", "支払を拒否"],
        detection_patterns: [
            /品質.*(?:満たない|不十分).*(?:支払|報酬)/,
        ],
        why_dangerous: "「品質基準」があいまいな場合、発注者の主観で支払いを拒否される可能性があります。これはフリーランス新法第5条の受領拒否に該当する可能性があります。",
        recommended_fix: "品質基準を具体的・客観的に定義するか、削除を求めてください。",
        negotiation_point: "「品質基準について、具体的な評価項目を明記していただけますでしょうか。お互いの認識を合わせるためにも重要だと考えます」",
    },
];

/**
 * テキストに対して既知の悪質パターンをチェック
 */
export function checkKnownBadPatterns(text: string): KnownBadPattern[] {
    const matches: KnownBadPattern[] = [];

    for (const pattern of KNOWN_BAD_PATTERNS) {
        // キーワードチェック
        const hasKeyword = pattern.detection_keywords.some(kw => text.includes(kw));

        // パターンチェック
        const hasPattern = pattern.detection_patterns?.some(p => p.test(text)) ?? false;

        if (hasKeyword || hasPattern) {
            matches.push(pattern);
        }
    }

    return matches;
}

/**
 * カテゴリ別にパターンを取得
 */
export function getPatternsByCategory(category: KnownBadPattern["category"]): KnownBadPattern[] {
    return KNOWN_BAD_PATTERNS.filter(p => p.category === category);
}
