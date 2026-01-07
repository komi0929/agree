// lib/rules/rule-checker.ts
// ルールベースチェッカー統合
//
// [精度向上ログ: 2024-12-25]
// 意図: 複数のルールチェッカーを統合し、一貫したインターフェースを提供
// 設計判断: Layer 1として、LLM解析の前に必ず実行
// [精度向上ログ: 2024-12-25 更新] 28チェックポイント対応で推奨条項チェックを追加

import { checkDangerPatterns, DangerPatternMatch } from "./danger-patterns";
import { checkRequiredClauses, RequiredClause } from "./required-clauses";
import { checkRecommendedClauses, RecommendedClause } from "./recommended-clauses";
import { analyzePaymentTerms, PaymentTermAnalysis } from "./payment-calculator";
import { checkKnownBadPatterns, KnownBadPattern } from "@/lib/knowledge/known-bad-patterns";
import { ViolatedLaw } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

/**
 * ルールベースチェックの結果アイテム
 */
export interface RuleBasedRisk {
    id: string;
    source: "danger_pattern" | "missing_clause" | "payment_rule" | "known_bad_pattern" | "recommended_clause";
    risk_level: RiskLevel;
    title: string;
    explanation: string;
    details?: string;
    law?: ViolatedLaw;
    suggested_fix?: string;
    negotiation_point?: string;
    matched_text?: string; // Contract text that triggered this risk (for highlighting)
}

/**
 * ルールベースチェックの全体結果
 */
export interface RuleBasedCheckResult {
    // 検出されたリスク
    risks: RuleBasedRisk[];

    // 統計情報
    stats: {
        total_risks: number;
        critical_count: number;
        high_count: number;
        medium_count: number;
        low_count: number;
    };

    // 60日ルール専用の詳細
    payment_analysis: PaymentTermAnalysis;

    // 欠落している必須条項
    missing_clauses: RequiredClause[];

    // 欠落している推奨条項
    missing_recommended: RecommendedClause[];
}

/**
 * DangerPatternをRuleBasedRiskに変換
 */
function convertDangerPattern(pattern: DangerPatternMatch): RuleBasedRisk {
    return {
        id: pattern.id,
        source: "danger_pattern",
        risk_level: pattern.risk,
        title: pattern.title,
        explanation: pattern.explanation,
        details: pattern.note,
        law: pattern.law,
        matched_text: pattern.matched_text, // Include matched text for highlighting
    };
}

/**
 * RequiredClauseをRuleBasedRiskに変換
 */
function convertMissingClause(clause: RequiredClause): RuleBasedRisk {
    return {
        id: clause.id,
        source: "missing_clause",
        risk_level: clause.missing_risk,
        title: clause.missing_title,
        explanation: clause.missing_message,
        details: clause.why_required,
    };
}

/**
 * PaymentTermAnalysisをRuleBasedRiskに変換（違反時のみ）
 */
function convertPaymentAnalysis(analysis: PaymentTermAnalysis): RuleBasedRisk | null {
    if (!analysis.violates60DayRule && analysis.riskLevel === "low") {
        return null;
    }

    return {
        id: "payment_60day_rule",
        source: "payment_rule",
        risk_level: analysis.riskLevel,
        title: analysis.violates60DayRule ? "60日ルール違反の可能性" : "支払期日に注意",
        explanation: analysis.explanation,
        details: analysis.details,
        law: "freelance_new_law_art4",
        suggested_fix: "支払期日を「納品日から60日以内」に修正してください。",
        negotiation_point: "フリーランス新法に基づき、納品から60日以内のお支払いをお願いできますでしょうか。",
    };
}

/**
 * KnownBadPatternをRuleBasedRiskに変換
 */
function convertKnownBadPattern(pattern: KnownBadPattern): RuleBasedRisk {
    return {
        id: pattern.id,
        source: "known_bad_pattern",
        risk_level: pattern.risk_level,
        title: pattern.name,
        explanation: pattern.why_dangerous,
        details: pattern.real_world_example,
        law: pattern.law,
        suggested_fix: pattern.recommended_fix,
        negotiation_point: pattern.negotiation_point,
    };
}

/**
 * RecommendedClauseをRuleBasedRiskに変換
 */
function convertRecommendedClause(clause: RecommendedClause): RuleBasedRisk {
    return {
        id: clause.id,
        source: "recommended_clause",
        risk_level: clause.missing_risk,
        title: clause.missing_title,
        explanation: clause.missing_message,
        details: clause.benefit,
        suggested_fix: clause.recommended_text,
    };
}

/**
 * 契約書テキストに対してすべてのルールベースチェックを実行
 * 
 * @param text 契約書のテキスト
 * @returns ルールベースチェックの結果
 */
export function runRuleBasedChecks(text: string): RuleBasedCheckResult {
    const risks: RuleBasedRisk[] = [];

    // 1. 危険パターンチェック
    const dangerPatterns = checkDangerPatterns(text);
    for (const pattern of dangerPatterns) {
        risks.push(convertDangerPattern(pattern));
    }

    // 2. 必須条項チェック
    const missingClauses = checkRequiredClauses(text);
    for (const clause of missingClauses) {
        risks.push(convertMissingClause(clause));
    }

    // 3. 60日ルール計算
    const paymentAnalysis = analyzePaymentTerms(text);
    const paymentRisk = convertPaymentAnalysis(paymentAnalysis);
    if (paymentRisk) {
        // 重複を避ける（danger_patternで既に検出されている場合）
        const alreadyDetected = risks.some(r =>
            r.law === "freelance_new_law_art4" && r.source === "danger_pattern"
        );
        if (!alreadyDetected) {
            risks.push(paymentRisk);
        }
    }

    // 4. 既知悪質パターンチェック
    const knownBadPatterns = checkKnownBadPatterns(text);
    for (const pattern of knownBadPatterns) {
        // 重複を避ける（同じ問題が複数のソースで検出される場合）
        const alreadyDetected = risks.some(r =>
            r.title === pattern.name ||
            (r.law && r.law === pattern.law)
        );
        if (!alreadyDetected) {
            risks.push(convertKnownBadPattern(pattern));
        }
    }

    // 5. 推奨条項チェック（28チェックポイント対応）
    const missingRecommended = checkRecommendedClauses(text);
    for (const clause of missingRecommended) {
        risks.push(convertRecommendedClause(clause));
    }

    // 統計情報を計算
    const stats = {
        total_risks: risks.length,
        critical_count: risks.filter(r => r.risk_level === "critical").length,
        high_count: risks.filter(r => r.risk_level === "high").length,
        medium_count: risks.filter(r => r.risk_level === "medium").length,
        low_count: risks.filter(r => r.risk_level === "low").length,
    };

    // リスクレベルでソート（critical > high > medium > low）
    const riskOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };
    risks.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

    return {
        risks,
        stats,
        payment_analysis: paymentAnalysis,
        missing_clauses: missingClauses,
        missing_recommended: missingRecommended,
    };
}

/**
 * クイックチェック: 重大なリスクがあるかどうか
 */
export function hasSignificantRisks(text: string): boolean {
    const result = runRuleBasedChecks(text);
    return result.stats.critical_count > 0 || result.stats.high_count > 0;
}
