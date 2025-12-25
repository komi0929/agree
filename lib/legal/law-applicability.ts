// lib/legal/law-applicability.ts
// 法律適用判定ロジック

import { UserContext, UserEntityType } from "@/lib/types/user-context";

/**
 * 適用される法律のフラグ
 */
export interface ApplicableLaws {
    /** フリーランス新法（基本規定：取引条件明示等） */
    freelanceNewLaw: boolean;

    /** フリーランス新法（厳格規定：支払期日・禁止行為・ハラスメント対策） */
    freelanceNewLawStrict: boolean;

    /** 下請法 */
    subcontractAct: boolean;

    /** 民法（常に適用） */
    civilCode: true;

    /** 著作権法（成果物がある場合） */
    copyrightLaw: boolean;
}

/**
 * ユーザーがフリーランス新法の保護対象かどうかを判定
 * 条件：従業員を使用しない個人または法人
 */
function isFreelanceProtectedEntity(entityType: UserEntityType): boolean {
    return entityType === "individual" || entityType === "one_person_corp";
}

/**
 * 相手方が「従業員を使用する事業者」かどうかを判定
 * この場合、フリーランス新法の厳格規定が適用される
 */
function isEmployerEntity(entityType: UserEntityType | "unknown"): boolean {
    if (entityType === "unknown") {
        // 不明な場合は安全側に倒す（厳格規定適用を想定）
        return true;
    }
    return entityType === "corp_with_employees";
}

/**
 * ユーザーコンテキストに基づいて適用法規を決定
 * 
 * @param ctx ユーザーコンテキスト
 * @returns 適用される法律のフラグ
 */
export function determineApplicableLaws(ctx: UserContext): ApplicableLaws {
    // Step 1: フリーランス新法の適用判定
    // 条件：ユーザーが受注者 かつ 従業員を使用しない個人/法人
    const isFreelanceProtected =
        ctx.userRole === "vendor" &&
        isFreelanceProtectedEntity(ctx.userEntityType);

    // Step 2: フリーランス新法の厳格規定の適用判定
    // 条件：上記 + 相手方が従業員を使用する事業者
    // 厳格規定には以下が含まれる：
    // - 支払期日規制（60日ルール）
    // - 禁止行為（受領拒否、報酬減額等）
    // - ハラスメント対策義務
    // - 育児・介護への配慮義務（6ヶ月以上の契約）
    const isStrictFreelanceLaw =
        isFreelanceProtected &&
        isEmployerEntity(ctx.counterpartyEntityType);

    // Step 3: 下請法の適用判定
    // 条件：資本金区分に基づく
    // - 親事業者: 資本金3億円超 → 下請事業者: 資本金3億円以下
    // - 親事業者: 資本金1,000万超〜3億円 → 下請事業者: 資本金1,000万円以下
    let isSubcontractActApplicable = false;

    if (ctx.userRole === "vendor") {
        const counterpartyCapital = ctx.counterpartyCapital;

        if (counterpartyCapital === "over_300m") {
            // 相手方が3億超なら、ほぼ確実に下請法適用
            isSubcontractActApplicable = true;
        } else if (counterpartyCapital === "10m_to_300m") {
            // 相手方が1,000万超〜3億で、ユーザーが1,000万以下なら適用
            // 個人事業主と一人法人は通常1,000万以下と推定
            isSubcontractActApplicable =
                ctx.userEntityType === "individual" ||
                ctx.userEntityType === "one_person_corp";
        }
    }

    // Step 4: 著作権法の適用判定
    // NDA以外の契約では成果物が発生する可能性が高い
    const isCopyrightRelevant =
        ctx.expectedContractType !== "nda" &&
        ctx.expectedContractType !== "advisory";

    return {
        freelanceNewLaw: isFreelanceProtected,
        freelanceNewLawStrict: isStrictFreelanceLaw,
        subcontractAct: isSubcontractActApplicable,
        civilCode: true,
        copyrightLaw: isCopyrightRelevant,
    };
}

/**
 * 適用法規の説明を日本語で生成
 */
export function explainApplicableLaws(laws: ApplicableLaws): string[] {
    const explanations: string[] = [];

    if (laws.freelanceNewLawStrict) {
        explanations.push(
            "フリーランス新法（2024年施行）の厳格規定が適用されます。" +
            "発注者には支払期日規制、禁止行為の遵守、ハラスメント対策義務があります。"
        );
    } else if (laws.freelanceNewLaw) {
        explanations.push(
            "フリーランス新法（2024年施行）の基本規定が適用されます。" +
            "発注者には取引条件の明示義務があります。"
        );
    }

    if (laws.subcontractAct) {
        explanations.push(
            "下請法も適用される可能性があります。" +
            "書面交付義務や支払遅延利息など、より厳格な規制が課されます。"
        );
    }

    if (laws.copyrightLaw) {
        explanations.push(
            "成果物に著作権が発生する可能性があります。" +
            "著作権の帰属と移転について注意が必要です。"
        );
    }

    return explanations;
}
