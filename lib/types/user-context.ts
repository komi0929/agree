// lib/types/user-context.ts
// ユーザー属性とコンテキスト情報の型定義

/**
 * ユーザーの事業形態
 */
export type UserEntityType =
    | "individual"           // 個人事業主
    | "one_person_corp"      // 一人法人（従業員なし）
    | "corp_with_employees"; // 従業員あり法人

/**
 * 資本金区分（下請法の適用判定に使用）
 */
export type CapitalRange =
    | "under_10m"     // 1,000万円以下
    | "10m_to_300m"   // 1,000万超〜3億円
    | "over_300m";    // 3億円超

/**
 * 契約類型
 */
export type ContractType =
    | "ukeoi"      // 請負（成果物の完成）
    | "jun_inin"   // 準委任（事務処理）
    | "nda"        // 秘密保持契約
    | "advisory"   // 顧問契約
    | "unknown";   // 不明

/**
 * ユーザーコンテキスト（契約書解析の前提条件）
 * このデータに基づいて適用法規が決定される
 */
export interface UserContext {
    /**
     * P_USER_TYPE: ユーザーは受注者か発注者か
     * - vendor: 受注者（フリーランス側）→ 保護を受ける立場
     * - client: 発注者 → 法令遵守義務を負う立場
     */
    userRole: "vendor" | "client";

    /**
     * P_ENTITY_TYPE: ユーザーの事業形態
     * フリーランス新法の適用判定に使用
     */
    userEntityType: UserEntityType;

    /**
     * P_COUNTERPARTY_ENTITY: 相手方の事業形態
     * フリーランス新法の厳格規定の適用判定に使用
     */
    counterpartyEntityType: UserEntityType | "unknown";

    /**
     * P_CLIENT_CAP: 相手方の資本金（推定可）
     * 下請法の適用判定に使用
     */
    counterpartyCapital: CapitalRange | "unknown";

    /**
     * P_IS_INVOICE: インボイス登録状況
     * 消費税条項のリスク評価に使用
     */
    isInvoiceRegistered: boolean | null;

    /**
     * P_CONTRACT_TYPE: 契約類型（想定）
     * 条項分類のヒントとして使用
     */
    expectedContractType: ContractType;

    /**
     * 契約期間（月数）
     * 1ヶ月以上の場合、フリーランス新法の禁止行為規定が適用
     * 6ヶ月以上の場合、育児・介護配慮義務が発生
     */
    contractDurationMonths: number | null;

    /**
     * P_CONTRACT_ROLE: 契約書上の立場（甲・乙）
     * これにより、「甲は〜」という条項が自分に対するものかを判定
     */
    contractRole: "party_a" | "party_b" | null;
}

/**
 * デフォルトのユーザーコンテキスト
 * 最もリスクが高い状態（フリーランス/受注者）を想定
 */
export const DEFAULT_USER_CONTEXT: UserContext = {
    userRole: "vendor",
    userEntityType: "individual",
    counterpartyEntityType: "unknown",
    counterpartyCapital: "unknown",
    isInvoiceRegistered: null,
    expectedContractType: "unknown",
    contractDurationMonths: null,
    contractRole: null,
};
