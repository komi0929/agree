// lib/rules/checkpoints-28.ts
// 28項目チェックポイント統合チェッカー
//
// [Phase 3改善: 2026-01-09]
// 意図: 28項目すべてを100%正確にルールベースでチェックし、建設的な提案を提供
// 設計判断: 決定論的（確率的ブレなし）なチェックで「治具」として機能

import { checkDangerPatterns, DangerPatternMatch, DANGER_PATTERNS } from "./danger-patterns";
import { checkRequiredClauses, RequiredClause, REQUIRED_CLAUSES } from "./required-clauses";
import { checkRecommendedClauses, RecommendedClause, RECOMMENDED_CLAUSES } from "./recommended-clauses";
import { analyzePaymentTerms } from "./payment-calculator";

export type CheckpointStatus = "clear" | "warning" | "critical" | "not_applicable";
export type RiskLevel = "critical" | "high" | "medium" | "low";

/**
 * 28項目チェックポイントの個別アイテム
 */
export interface CheckpointItem {
    id: string;           // "CP001" ~ "CP028"
    item_no: number;      // 1-28
    name: string;         // 項目名
    category: "danger" | "missing" | "recommended" | "payment";
    status: CheckpointStatus;
    risk_level?: RiskLevel;
    detected_text?: string;  // 検出された問題箇所
    message?: string;        // 検出時のメッセージ
    suggestion?: string;     // 建設的な提案
    benefit?: string;        // この提案を採用するメリット
}

/**
 * 28項目チェックの全体結果
 */
export interface CheckpointResult {
    items: CheckpointItem[];
    summary: {
        total: number;
        clear: number;
        warning: number;
        critical: number;
    };
}

// ===========================================
// 28項目のマスターデータ
// ===========================================
const CHECKPOINT_DEFINITIONS: Array<{
    id: string;
    item_no: number;
    name: string;
    category: "danger" | "missing" | "recommended" | "payment";
    description: string;
}> = [
        // 1-11: 危険パターン系（danger-patterns.tsに対応）
        { id: "CP001", item_no: 1, name: "支払サイト60日ルール", category: "payment", description: "フリーランス新法第4条違反チェック" },
        { id: "CP002", item_no: 2, name: "支払起算点", category: "danger", description: "納品日起算を回避するパターンの検出" },
        { id: "CP003", item_no: 3, name: "損害賠償上限", category: "danger", description: "無制限賠償責任の検出" },
        { id: "CP004", item_no: 4, name: "禁止行為", category: "danger", description: "フリーランス新法第5条違反チェック" },
        { id: "CP005", item_no: 5, name: "著作権条項", category: "danger", description: "著作権の完全譲渡・人格権不行使の検出" },
        { id: "CP006", item_no: 6, name: "業務範囲の明確性", category: "danger", description: "スコープクリープの検出" },
        { id: "CP007", item_no: 7, name: "競業避止", category: "danger", description: "過度な競業禁止条項の検出" },
        { id: "CP008", item_no: 8, name: "契約不適合責任", category: "danger", description: "長すぎる責任期間の検出" },
        { id: "CP009", item_no: 9, name: "裁判管轄", category: "danger", description: "発注者有利の管轄条項の検出" },
        { id: "CP010", item_no: 10, name: "偽装請負リスク", category: "danger", description: "雇用関係の特徴を持つ条項の検出" },
        { id: "CP011", item_no: 11, name: "AI学習利用", category: "danger", description: "成果物のAI学習利用リスクの検出" },

        // 12-28: 推奨条項系（recommended-clauses.tsに対応）
        { id: "CP012", item_no: 12, name: "みなし検収", category: "recommended", description: "検収放置リスクへの対策" },
        { id: "CP013", item_no: 13, name: "遅延利息", category: "recommended", description: "支払遅延への抑止力" },
        { id: "CP014", item_no: 14, name: "消費税明記", category: "recommended", description: "税込・税別の明確化" },
        { id: "CP015", item_no: 15, name: "経費負担", category: "recommended", description: "実費負担者の明確化" },
        { id: "CP016", item_no: 16, name: "着手金", category: "recommended", description: "長期案件の資金繰り対策" },
        { id: "CP017", item_no: 17, name: "中途解約精算", category: "recommended", description: "タダ働きリスクへの対策" },
        { id: "CP018", item_no: 18, name: "物価・仕様変更対応", category: "recommended", description: "インフレ・要件変更への対応" },
        { id: "CP019", item_no: 19, name: "履行遅滞免責", category: "recommended", description: "クライアント起因の遅延への対策" },
        { id: "CP020", item_no: 20, name: "AIツール利用許可", category: "recommended", description: "業務効率化の余地確保" },
        { id: "CP021", item_no: 21, name: "背景IP留保", category: "recommended", description: "既存ノウハウの権利確保" },
        { id: "CP022", item_no: 22, name: "実績公開権", category: "recommended", description: "ポートフォリオ利用権" },
        { id: "CP023", item_no: 23, name: "クレジット表記", category: "recommended", description: "著作者名表示権" },
        { id: "CP024", item_no: 24, name: "引き抜き禁止", category: "recommended", description: "チームメンバーの中抜き防止" },
        { id: "CP025", item_no: 25, name: "連絡対応時間", category: "recommended", description: "深夜休日対応の防止" },
        { id: "CP026", item_no: 26, name: "ハラスメント解除", category: "recommended", description: "悪質クライアントからの逃避権" },
        { id: "CP027", item_no: 27, name: "特急料金", category: "recommended", description: "短納期依頼の抑制・収益化" },
        { id: "CP028", item_no: 28, name: "自動更新", category: "recommended", description: "継続案件の手間削減" },
    ];

// ===========================================
// 28項目チェック実行関数
// ===========================================
export function runAllCheckpoints(text: string): CheckpointResult {
    const items: CheckpointItem[] = [];

    // 1. 危険パターンチェック結果を取得
    const dangerMatches = checkDangerPatterns(text);

    // 2. 支払期日ルールチェック
    const paymentAnalysis = analyzePaymentTerms(text);

    // 3. 推奨条項チェック
    const missingRecommended = checkRecommendedClauses(text);

    // 4. 必須条項チェック
    const missingRequired = checkRequiredClauses(text);

    // CP001: 60日ルール
    items.push({
        id: "CP001",
        item_no: 1,
        name: "支払サイト60日ルール",
        category: "payment",
        status: paymentAnalysis.violates60DayRule ? "critical" : "clear",
        risk_level: paymentAnalysis.riskLevel,
        detected_text: paymentAnalysis.matchedText,
        message: paymentAnalysis.violates60DayRule ? paymentAnalysis.explanation : undefined,
        suggestion: paymentAnalysis.violates60DayRule
            ? "支払期日を「納品日から60日以内」に修正してください。"
            : undefined,
        benefit: "フリーランス新法に準拠し、キャッシュフローを改善",
    });

    // CP002-CP011: 危険パターン系
    const dangerCategories = ["acceptance", "liability", "prohibited", "copyright", "scope", "non_compete", "conformity", "jurisdiction", "employment", "ai_usage"];

    for (let i = 2; i <= 11; i++) {
        const def = CHECKPOINT_DEFINITIONS.find(d => d.item_no === i)!;

        // このカテゴリに該当する危険パターンを取得
        const relatedMatches = dangerMatches.filter(m => {
            // IDのプレフィックスでカテゴリを判定
            const category = Object.keys(DANGER_PATTERNS).find(cat =>
                DANGER_PATTERNS[cat].some(p => p.id === m.id)
            );
            return (i === 2 && category === "acceptance") ||
                (i === 3 && category === "liability") ||
                (i === 4 && category === "prohibited") ||
                (i === 5 && category === "copyright") ||
                (i === 6 && category === "scope") ||
                (i === 7 && category === "non_compete") ||
                (i === 8 && category === "conformity") ||
                (i === 9 && category === "jurisdiction") ||
                (i === 10 && category === "employment") ||
                (i === 11 && category === "ai_usage");
        });

        const hasIssue = relatedMatches.length > 0;
        const highestRisk = hasIssue
            ? relatedMatches.reduce((max, m) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 };
                return order[m.risk as RiskLevel] < order[max] ? m.risk as RiskLevel : max;
            }, "low" as RiskLevel)
            : undefined;

        items.push({
            id: def.id,
            item_no: def.item_no,
            name: def.name,
            category: "danger",
            status: hasIssue ? (highestRisk === "critical" ? "critical" : "warning") : "clear",
            risk_level: highestRisk,
            detected_text: relatedMatches[0]?.matched_text,
            message: relatedMatches[0]?.explanation,
            suggestion: relatedMatches[0]?.note,
        });
    }

    // CP012-CP028: 推奨条項系
    for (let i = 12; i <= 28; i++) {
        const def = CHECKPOINT_DEFINITIONS.find(d => d.item_no === i)!;
        const recommendedClause = RECOMMENDED_CLAUSES.find(c => c.item_no === i);

        if (!recommendedClause) continue;

        const isMissing = missingRecommended.some(m => m.item_no === i);

        items.push({
            id: def.id,
            item_no: def.item_no,
            name: def.name,
            category: "recommended",
            status: isMissing ? "warning" : "clear",
            risk_level: isMissing ? recommendedClause.missing_risk : undefined,
            message: isMissing ? recommendedClause.missing_message : undefined,
            suggestion: isMissing ? recommendedClause.recommended_text : undefined,
            benefit: isMissing ? recommendedClause.benefit : undefined,
        });
    }

    // サマリー計算
    const summary = {
        total: items.length,
        clear: items.filter(i => i.status === "clear").length,
        warning: items.filter(i => i.status === "warning").length,
        critical: items.filter(i => i.status === "critical").length,
    };

    return { items, summary };
}

/**
 * クイックサマリー文を生成
 */
export function generateCheckpointSummary(result: CheckpointResult): string {
    const { summary } = result;

    if (summary.critical > 0) {
        return `${summary.critical}件の重大な問題と${summary.warning}件の確認推奨事項が見つかりました。`;
    } else if (summary.warning > 0) {
        return `${summary.warning}件の確認推奨事項があります。${summary.clear}/${summary.total}項目はクリアです。`;
    } else {
        return `すべての${summary.total}項目がクリアです。契約書の品質は良好です。`;
    }
}
