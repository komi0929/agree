// lib/types/clause-tags.ts
// 条項分類タグの定義

/**
 * 条項分類タグ
 * AIが契約書を解析する際、各条項にこのタグを付与する
 */
export type ClauseTag =
    | "CLAUSE_SCOPE"        // 業務内容・仕様
    | "CLAUSE_PAYMENT"      // 報酬・支払時期
    | "CLAUSE_ACCEPTANCE"   // 検収・受入
    | "CLAUSE_IP"           // 知的財産権・著作権
    | "CLAUSE_LIABILITY"    // 損害賠償・免責
    | "CLAUSE_TERM"         // 契約期間・更新
    | "CLAUSE_TERMINATION"  // 解除・解約
    | "CLAUSE_NON_COMPETE"  // 競業避止
    | "CLAUSE_JURISDICTION" // 管轄裁判所
    | "CLAUSE_CONFIDENTIAL" // 秘密保持
    | "CLAUSE_HARASSMENT"   // ハラスメント対策
    | "CLAUSE_REDELEGATE"   // 再委託
    | "CLAUSE_INVOICE"      // インボイス・消費税
    | "CLAUSE_OTHER";       // その他

/**
 * 条項タグの日本語名称
 */
export const CLAUSE_TAG_LABELS: Record<ClauseTag, string> = {
    CLAUSE_SCOPE: "業務内容",
    CLAUSE_PAYMENT: "報酬・支払",
    CLAUSE_ACCEPTANCE: "検収",
    CLAUSE_IP: "知的財産権",
    CLAUSE_LIABILITY: "損害賠償",
    CLAUSE_TERM: "契約期間",
    CLAUSE_TERMINATION: "解除・解約",
    CLAUSE_NON_COMPETE: "競業避止",
    CLAUSE_JURISDICTION: "管轄裁判所",
    CLAUSE_CONFIDENTIAL: "秘密保持",
    CLAUSE_HARASSMENT: "ハラスメント",
    CLAUSE_REDELEGATE: "再委託",
    CLAUSE_INVOICE: "消費税",
    CLAUSE_OTHER: "その他",
};

/**
 * 違反の可能性がある法律条項
 */
export type ViolatedLaw =
    | "freelance_new_law_art3"   // 取引条件明示義務（第3条）
    | "freelance_new_law_art4"   // 60日支払ルール（第4条）
    | "freelance_new_law_art5"   // 禁止行為（第5条）
    | "freelance_new_law_art12"  // ハラスメント対策（第12条）
    | "freelance_new_law_art13"  // 育児・介護配慮（第13条）
    | "subcontract_act"          // 下請法
    | "civil_code_conformity"    // 契約不適合責任
    | "copyright_art27_28"       // 著作権27/28条
    | "disguised_employment"     // 偽装請負
    | "antitrust_underpayment"   // 独禁法・買いたたき
    | "public_order";            // 公序良俗違反

/**
 * 違反法律の日本語説明
 */
export const VIOLATED_LAW_EXPLANATIONS: Record<ViolatedLaw, string> = {
    freelance_new_law_art3: "フリーランス新法 第3条（取引条件の明示義務）",
    freelance_new_law_art4: "フリーランス新法 第4条（60日以内の支払期日）",
    freelance_new_law_art5: "フリーランス新法 第5条（禁止行為）",
    freelance_new_law_art12: "フリーランス新法 第12条（ハラスメント対策）",
    freelance_new_law_art13: "フリーランス新法 第13条（育児・介護への配慮）",
    subcontract_act: "下請法",
    civil_code_conformity: "民法（契約不適合責任）",
    copyright_art27_28: "著作権法 第27条・第28条（特掲の要件）",
    disguised_employment: "労働基準法・労働契約法（偽装請負の疑い）",
    antitrust_underpayment: "独占禁止法（買いたたき）",
    public_order: "民法 第90条（公序良俗違反）",
};
