// lib/legal/result-merger.ts
// ルールベース結果とLLM結果の統合
//
// [精度向上ログ: 2024-12-25]
// 意図: Layer 4として、複数ソースの結果を統合し、重複を排除
// 設計判断: 矛盾がある場合はより厳しい方を採用

import { RuleBasedRisk, RuleBasedCheckResult } from "@/lib/rules/rule-checker";
import { EnhancedAnalysisResult } from "@/lib/ai-service";
import { ViolatedLaw, VIOLATED_LAW_EXPLANATIONS, ClauseTag } from "@/lib/types/clause-tags";
import { calculateDeterministicScore, DeterministicScore } from "@/lib/rules/deterministic-scorer";

type RiskLevel = "critical" | "high" | "medium" | "low";

/**
 * 統合されたリスクアイテム
 */
export interface MergedRisk {
    id: string;
    source: "rule" | "llm" | "both";
    clause_tag: ClauseTag;
    risk_level: RiskLevel;
    section_title: string;
    original_text?: string;
    explanation: string;
    violated_laws: ViolatedLaw[];
    suggestion: {
        revised_text: string;
        negotiation_message: {
            formal: string;
            neutral: string;
            casual: string;
        };
        legal_basis: string;
    };
}

/**
 * 統合された解析結果
 */
export interface MergedAnalysisResult {
    summary: string;
    risks: MergedRisk[];
    contract_classification: EnhancedAnalysisResult["contract_classification"];
    missing_clauses: string[];

    // 統計
    stats: {
        total_risks: number;
        rule_based_risks: number;
        llm_risks: number;
        critical_count: number;
        high_count: number;
    };

    // 決定論的スコア（100%再現性）
    deterministicScore: DeterministicScore;
}

/**
 * ルールベースのリスクをMergedRiskに変換
 */
function convertRuleBasedRisk(risk: RuleBasedRisk): MergedRisk {
    // Generate context-specific messages using the risk title
    const contextTitle = risk.title.replace(/[がありませんの規定]/g, "").trim();

    return {
        id: risk.id,
        source: "rule",
        clause_tag: guessClauseTagFromRisk(risk),
        risk_level: risk.risk_level,
        section_title: risk.title,
        original_text: risk.matched_text, // Use matched text for highlighting
        explanation: risk.explanation,
        violated_laws: risk.law ? [risk.law] : [],
        suggestion: {
            // Priority: LLM will override this. If not, this fallback must be strict.
            revised_text: risk.suggested_fix || "（LLMによる自動修正を適用します）",
            negotiation_message: {
                formal: `${contextTitle}の修正を希望します。`,
                neutral: `${contextTitle}を修正してください。`,
                casual: `${contextTitle}直して。`,
            },
            legal_basis: risk.details || (risk.law ? VIOLATED_LAW_EXPLANATIONS[risk.law] : ""),
        },
    };
}

/**
 * リスクからClauseTagを推測
 */
function guessClauseTagFromRisk(risk: RuleBasedRisk): ClauseTag {
    if (risk.source === "payment_rule" || risk.id.includes("payment")) {
        return "CLAUSE_PAYMENT";
    }
    if (risk.source === "missing_clause") {
        // missing clauseはそれぞれのtagを持っている
        return "CLAUSE_OTHER";
    }
    if (risk.law === "copyright_art27_28") {
        return "CLAUSE_IP";
    }
    if (risk.law === "civil_code_conformity") {
        return "CLAUSE_LIABILITY";
    }
    if (risk.law === "disguised_employment") {
        return "CLAUSE_SCOPE";
    }
    if (risk.law === "public_order" && risk.id.includes("non_compete")) {
        return "CLAUSE_NON_COMPETE";
    }
    return "CLAUSE_OTHER";
}

/**
 * LLMのリスクをMergedRiskに変換
 */
function convertLLMRisk(risk: EnhancedAnalysisResult["risks"][0]): MergedRisk {
    return {
        id: `llm_${risk.section_title.replace(/\s/g, "_")}`,
        source: "llm",
        clause_tag: risk.clause_tag as ClauseTag,
        risk_level: risk.risk_level as RiskLevel,
        section_title: risk.section_title,
        original_text: risk.original_text,
        explanation: risk.explanation,
        violated_laws: risk.violated_laws as ViolatedLaw[],
        suggestion: risk.suggestion,
    };
}

/**
 * 2つのリスクが同じ問題を指しているか判定
 */
function isSameRisk(a: MergedRisk, b: MergedRisk): boolean {
    // 同じ法律違反を指摘している
    if (a.violated_laws.length > 0 && b.violated_laws.length > 0) {
        const sharedLaws = a.violated_laws.filter(law => b.violated_laws.includes(law));
        if (sharedLaws.length > 0) return true;
    }

    // 同じ条項タグで、タイトルが類似
    if (a.clause_tag === b.clause_tag) {
        const aNormalized = a.section_title.toLowerCase().replace(/\s/g, "");
        const bNormalized = b.section_title.toLowerCase().replace(/\s/g, "");
        if (aNormalized.includes(bNormalized) || bNormalized.includes(aNormalized)) {
            return true;
        }
    }

    return false;
}

/**
 * 2つのリスクをマージ（より厳しい方を採用）
 */
function mergeRisks(ruleRisk: MergedRisk, llmRisk: MergedRisk): MergedRisk {
    const riskOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };

    // より厳しいリスクレベルを採用
    const stricterLevel = riskOrder[ruleRisk.risk_level] <= riskOrder[llmRisk.risk_level]
        ? ruleRisk.risk_level
        : llmRisk.risk_level;

    // 違反法律をマージ
    const allLaws = [...new Set([...ruleRisk.violated_laws, ...llmRisk.violated_laws])];

    return {
        id: ruleRisk.id,
        source: "both",
        clause_tag: llmRisk.clause_tag, // LLMの方がより正確
        risk_level: stricterLevel,
        section_title: llmRisk.section_title, // LLMの方がより具体的
        original_text: llmRisk.original_text,
        explanation: `${ruleRisk.explanation}\n\n${llmRisk.explanation}`,
        violated_laws: allLaws,
        suggestion: {
            // FORCE LLM Suggestion if available, as the Prompt is now "Perfect"
            revised_text: llmRisk.suggestion.revised_text && llmRisk.suggestion.revised_text.length > 10
                ? llmRisk.suggestion.revised_text
                : (ruleRisk.suggestion.revised_text || "修正案の生成に失敗しました"),
            negotiation_message: llmRisk.suggestion.negotiation_message,
            legal_basis: llmRisk.suggestion.legal_basis
        }
    };
}

/**
 * ルールベース結果とLLM結果を統合
 */
export function mergeAnalysisResults(
    ruleResult: RuleBasedCheckResult,
    llmResult: EnhancedAnalysisResult
): MergedAnalysisResult {
    const mergedRisks: MergedRisk[] = [];

    // ルールベースのリスクを変換
    const ruleRisks = ruleResult.risks.map(convertRuleBasedRisk);

    // LLMのリスクを変換
    const llmRisks = llmResult.risks.map(convertLLMRisk);

    // マッチングとマージ
    const usedLLMIndices = new Set<number>();

    for (const ruleRisk of ruleRisks) {
        let merged = false;

        for (let i = 0; i < llmRisks.length; i++) {
            if (usedLLMIndices.has(i)) continue;

            if (isSameRisk(ruleRisk, llmRisks[i])) {
                // 同じ問題 -> マージ
                mergedRisks.push(mergeRisks(ruleRisk, llmRisks[i]));
                usedLLMIndices.add(i);
                merged = true;
                break;
            }
        }

        if (!merged) {
            // ルールベースのみで検出
            mergedRisks.push(ruleRisk);
        }
    }

    // LLMのみで検出されたリスクを追加
    for (let i = 0; i < llmRisks.length; i++) {
        if (!usedLLMIndices.has(i)) {
            mergedRisks.push(llmRisks[i]);
        }
    }

    // リスクレベルでソート
    const riskOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
    };
    mergedRisks.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

    // 欠落条項をマージ
    const missingClauses = [
        ...ruleResult.missing_clauses.map(c => c.missing_title),
        ...llmResult.missing_clauses,
    ];
    const uniqueMissingClauses = [...new Set(missingClauses)];

    // 決定論的スコアを計算（ルールベースのみ - 100%再現性）
    const deterministicScore = calculateDeterministicScore(ruleResult);

    return {
        summary: llmResult.summary,
        risks: mergedRisks,
        contract_classification: llmResult.contract_classification,
        missing_clauses: uniqueMissingClauses,
        stats: {
            total_risks: mergedRisks.length,
            rule_based_risks: ruleResult.stats.total_risks,
            llm_risks: llmResult.risks.length,
            critical_count: mergedRisks.filter(r => r.risk_level === "critical").length,
            high_count: mergedRisks.filter(r => r.risk_level === "high").length,
        },
        deterministicScore,
    };
}
