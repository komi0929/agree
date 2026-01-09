// lib/rules/deterministic-scorer.ts
// 決定論的スコア計算モジュール
//
// [精度向上ログ: 2026-01-09]
// 意図: AIに依存しないスコア計算で100%再現性を実現
// 設計判断: ルールベース検出結果のみでスコアを算出

import { RuleBasedCheckResult, RiskLevel } from "./rule-checker";

/**
 * リスクレベルごとのスコア減点値
 * 100点満点からスタートし、検出されたリスクに応じて減点
 */
const SCORE_WEIGHTS: Record<RiskLevel, number> = {
    critical: -25,  // 致命的リスク: 25点減点
    high: -15,      // 高リスク: 15点減点
    medium: -8,     // 中リスク: 8点減点
    low: -3,        // 低リスク: 3点減点
};

/**
 * スコアのグレード定義
 */
export type ScoreGrade = "A" | "B" | "C" | "D" | "F";

export interface DeterministicScore {
    /** 0-100の数値スコア */
    score: number;
    /** スコアのグレード (A/B/C/D/F) */
    grade: ScoreGrade;
    /** スコアの解説 */
    explanation: string;
    /** 各リスクレベルの検出数 */
    breakdown: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

/**
 * スコアからグレードを決定
 */
function getGrade(score: number): ScoreGrade {
    if (score >= 85) return "A";
    if (score >= 70) return "B";
    if (score >= 55) return "C";
    if (score >= 40) return "D";
    return "F";
}

/**
 * グレードに応じた解説を生成
 */
function getExplanation(grade: ScoreGrade, breakdown: DeterministicScore["breakdown"]): string {
    const hasCritical = breakdown.critical > 0;
    const hasHigh = breakdown.high > 0;

    switch (grade) {
        case "A":
            return "この契約書は概ね安全です。軽微な確認事項があります。";
        case "B":
            return "この契約書はおおむね問題ありませんが、いくつかの確認事項があります。";
        case "C":
            if (hasCritical) {
                return "重大なリスクが含まれています。契約前に必ず確認してください。";
            }
            return "複数のリスク項目があります。修正交渉を検討してください。";
        case "D":
            if (hasCritical) {
                return "複数の重大なリスクがあります。このままの契約は推奨しません。";
            }
            return "多くのリスク項目があります。専門家への相談を推奨します。";
        case "F":
            return "この契約書には深刻なリスクがあります。契約の再検討を強く推奨します。";
    }
}

/**
 * ルールベース検出結果から決定論的スコアを計算
 * 
 * @param ruleResult ルールベースチェックの結果
 * @returns 決定論的スコア
 */
export function calculateDeterministicScore(ruleResult: RuleBasedCheckResult): DeterministicScore {
    const breakdown = {
        critical: ruleResult.stats.critical_count,
        high: ruleResult.stats.high_count,
        medium: ruleResult.stats.medium_count,
        low: ruleResult.stats.low_count,
    };

    // 基本スコア100点から減点
    let score = 100;
    score += breakdown.critical * SCORE_WEIGHTS.critical;
    score += breakdown.high * SCORE_WEIGHTS.high;
    score += breakdown.medium * SCORE_WEIGHTS.medium;
    score += breakdown.low * SCORE_WEIGHTS.low;

    // スコアを0-100の範囲にクランプ
    score = Math.max(0, Math.min(100, score));

    const grade = getGrade(score);
    const explanation = getExplanation(grade, breakdown);

    return {
        score,
        grade,
        explanation,
        breakdown,
    };
}

/**
 * スコアのハッシュ値を生成（キャッシュ検証用）
 * 同じ入力に対して常に同じハッシュを返す
 */
export function generateScoreHash(score: DeterministicScore): string {
    const data = `${score.score}:${score.breakdown.critical}:${score.breakdown.high}:${score.breakdown.medium}:${score.breakdown.low}`;
    // 簡易ハッシュ（crypto不要）
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}
