// lib/speculative-analysis.ts
// 投機的実行による体感速度最適化
//
// PDFアップロード完了時点でデフォルト仮定に基づき解析を開始し、
// ユーザーが選択肢を入力している間に裏で解析を完了させる

import { UserContext } from "@/lib/types/user-context";
import { EnhancedAnalysisResult } from "@/lib/types/analysis";
import { runRuleBasedChecks, RuleBasedCheckResult } from "@/lib/rules/rule-checker";

/**
 * デフォルトのユーザーコンテキスト（投機的実行用）
 * 
 * 80%以上のユーザーがフリーランス（受託者）であると仮定
 */
export const SPECULATIVE_DEFAULT_CONTEXT: UserContext = {
    userRole: "vendor",                    // 受託者（フリーランス）
    userEntityType: "individual",          // 個人事業主
    counterpartyEntityType: "unknown",     // 相手の事業形態は不明
    counterpartyCapital: "unknown",        // 相手の資本金は不明
    isInvoiceRegistered: null,             // インボイス状況は不明
    expectedContractType: "unknown",       // 契約類型は不明
    contractDurationMonths: null,          // 契約期間は不明
    contractRole: null,                    // 契約上の立場は不明
};

/**
 * 投機的解析の結果キャッシュ
 */
export interface SpeculativeAnalysisCache {
    // 解析に使用したコンテキスト
    usedContext: UserContext;

    // ルールベースチェック結果（コンテキスト非依存）
    ruleBasedResult: RuleBasedCheckResult;

    // 統合された解析結果
    analysisResult: EnhancedAnalysisResult;

    // 契約書テキスト
    contractText: string;

    // タイムスタンプ
    timestamp: number;
}

/**
 * コンテキストが投機的実行の仮定と一致するか判定
 */
export function isContextMatch(
    actual: UserContext,
    speculative: UserContext = SPECULATIVE_DEFAULT_CONTEXT
): boolean {
    // 主要な判定項目のみチェック
    // userRoleとuserEntityTypeが一致していれば、大筋の法律適用判定は同じ
    return (
        actual.userRole === speculative.userRole &&
        actual.userEntityType === speculative.userEntityType
    );
}

/**
 * コンテキストの差分を判定
 */
export function getContextDiff(
    actual: UserContext,
    speculative: UserContext = SPECULATIVE_DEFAULT_CONTEXT
): {
    roleChanged: boolean;
    lawApplicabilityChanged: boolean;
    needsFullReanalysis: boolean;
} {
    const roleChanged = actual.userRole !== speculative.userRole;

    // 法律適用が変わるケース
    // - 個人事業主 → 法人（資本金次第でフリーランス新法適用外）
    // - ユーザーの事業形態が変わった
    const lawApplicabilityChanged =
        actual.userEntityType !== speculative.userEntityType;

    // 甲乙が変わる or 法律適用が変わる場合は完全再解析が必要
    const needsFullReanalysis = roleChanged || lawApplicabilityChanged;

    return { roleChanged, lawApplicabilityChanged, needsFullReanalysis };
}

/**
 * 投機的解析を開始する
 * 
 * @param contractText 契約書テキスト
 * @param analyzeFunction 解析関数（analyzeDeepAction）
 * @returns Promise<SpeculativeAnalysisCache>
 */
export async function startSpeculativeAnalysis(
    contractText: string,
    analyzeFunction: (text: string, context: UserContext) => Promise<{
        success: boolean;
        data?: EnhancedAnalysisResult;
        error?: string;
    }>
): Promise<SpeculativeAnalysisCache | null> {
    try {
        const startTime = Date.now();

        // ルールベースチェックは即座に実行（コンテキスト非依存）
        const ruleBasedResult = runRuleBasedChecks(contractText);

        // デフォルトコンテキストでLLM解析を開始
        const result = await analyzeFunction(contractText, SPECULATIVE_DEFAULT_CONTEXT);

        if (!result.success || !result.data) {
            console.error("Speculative analysis failed:", result.error);
            return null;
        }

        console.log(`Speculative analysis completed in ${Date.now() - startTime}ms`);

        return {
            usedContext: SPECULATIVE_DEFAULT_CONTEXT,
            ruleBasedResult,
            analysisResult: result.data,
            contractText,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error("Speculative analysis error:", error);
        return null;
    }
}
