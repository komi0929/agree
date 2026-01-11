// lib/rules/freelance-law-art3-checker.ts
// フリーランス新法第3条「取引条件明示7項目」チェッカー
//
// [実装: 2026-01-11]
// 意図: 新法で義務化された7項目が全て明記されているかをチェック
// 設計判断: 欠落項目を個別に特定し、追加を促す

import { ClauseTag } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface Art3Item {
    id: string;
    item_no: number;  // 1-7
    name: string;
    tag: ClauseTag;
    description: string;
    detection_patterns: RegExp[];
    missing_risk: RiskLevel;
    missing_message: string;
    recommended_text: string;
    law_reference: string;
}

/**
 * フリーランス新法第3条で明示が義務付けられた7項目
 * 
 * 参考: フリーランス・事業者間取引適正化等法 第3条
 */
export const FREELANCE_LAW_ART3_ITEMS: Art3Item[] = [
    {
        id: "art3_001",
        item_no: 1,
        name: "当事者の名称",
        tag: "CLAUSE_OTHER",
        description: "発注者および受注者の正式名称・住所",
        detection_patterns: [
            /(?:甲|発注者|委託者).*(?:株式会社|有限会社|合同会社|一般社団)/,
            /(?:乙|受注者|受託者)/,
            /住所|所在地/,
        ],
        missing_risk: "high",
        missing_message: "当事者（発注者・受注者）の名称や住所が明記されていない可能性があります。トラブル時の訴訟対象を明確化するため、正式な法人名と住所を記載してください。",
        recommended_text: "甲: 株式会社〇〇（住所: 東京都〇〇区...）\n乙: 〇〇〇〇（住所: ...）",
        law_reference: "フリーランス新法第3条第1号",
    },
    {
        id: "art3_002",
        item_no: 2,
        name: "委託日",
        tag: "CLAUSE_TERM",
        description: "業務委託を行った年月日",
        detection_patterns: [
            /(?:委託|契約)(?:日|年月日)/,
            /(?:令和|20\d{2})年.*月.*日/,
            /契約締結日/,
        ],
        missing_risk: "medium",
        missing_message: "業務委託日（契約締結日）が明記されていません。支払期日の起算点となる重要な情報です。",
        recommended_text: "本契約は令和〇年〇月〇日に締結する。",
        law_reference: "フリーランス新法第3条第2号",
    },
    {
        id: "art3_003",
        item_no: 3,
        name: "給付の内容",
        tag: "CLAUSE_SCOPE",
        description: "業務内容・仕様・数量など",
        detection_patterns: [
            /業務.*(?:内容|範囲)/,
            /委託.*(?:内容|業務)/,
            /(?:作業|業務).*(?:項目|仕様)/,
            /成果物/,
            /別紙.*(?:仕様|内容)/,
        ],
        missing_risk: "critical",
        missing_message: "業務内容（給付の内容）が明確に定義されていません。「何をどこまでやるか」が曖昧だと、無限に追加作業を求められるリスクがあります。",
        recommended_text: "乙は甲に対し、別紙仕様書に定める業務を遂行する。",
        law_reference: "フリーランス新法第3条第3号",
    },
    {
        id: "art3_004",
        item_no: 4,
        name: "納期・役務提供期間",
        tag: "CLAUSE_TERM",
        description: "納品期日または役務の提供期間",
        detection_patterns: [
            /納期|納品.*期日|納品.*期限/,
            /(?:提供|契約).*期間/,
            /(?:開始|終了).*(?:日|期日)/,
            /(?:\d+)(?:日|週間|ヶ月).*(?:以内|まで)/,
        ],
        missing_risk: "high",
        missing_message: "納期または役務提供期間が明記されていません。スケジュール遅延の責任分界点が不明確です。",
        recommended_text: "納品期日: 令和〇年〇月〇日\nまたは\n契約期間: 令和〇年〇月〇日から令和〇年〇月〇日まで",
        law_reference: "フリーランス新法第3条第4号",
    },
    {
        id: "art3_005",
        item_no: 5,
        name: "納品場所・方法",
        tag: "CLAUSE_SCOPE",
        description: "成果物の納品場所・納品方法",
        detection_patterns: [
            /納品.*(?:場所|方法)/,
            /(?:メール|データ|サーバー).*(?:送付|納品|アップロード)/,
            /納品.*(?:形式|形態)/,
            /引渡.*(?:場所|方法)/,
        ],
        missing_risk: "low",
        missing_message: "納品場所や納品方法が明記されていません。データ送付先やファイル形式を明確にしておくと安心です。",
        recommended_text: "成果物はメールにて甲の指定するアドレスに送付する。",
        law_reference: "フリーランス新法第3条第5号",
    },
    {
        id: "art3_006",
        item_no: 6,
        name: "検査完了期日",
        tag: "CLAUSE_ACCEPTANCE",
        description: "検収（検査）を完了する期日",
        detection_patterns: [
            /検収.*(?:期間|期日|日以内)/,
            /検査.*(?:期間|期日|完了)/,
            /(?:\d+)日.*(?:以内|まで).*(?:検収|検査)/,
        ],
        missing_risk: "high",
        missing_message: "検査完了期日（検収期間）が明記されていません。「まだ確認していない」という理由で支払いを無限に延期されるリスクがあります。",
        recommended_text: "甲は成果物を受領後10日以内に検査を完了する。",
        law_reference: "フリーランス新法第3条第6号",
    },
    {
        id: "art3_007",
        item_no: 7,
        name: "報酬額・支払期日",
        tag: "CLAUSE_PAYMENT",
        description: "報酬の金額と支払期日",
        detection_patterns: [
            /報酬.*(?:金額|額|円)/,
            /(?:対価|代金).*(?:\d+|円)/,
            /支払.*(?:期日|期限)/,
            /(?:翌月末|月末|日以内).*(?:支払|払い)/,
        ],
        missing_risk: "critical",
        missing_message: "報酬額または支払期日が明記されていません。「いつ」「いくら」支払われるかが不明確な状態は極めて危険です。",
        recommended_text: "報酬: 金〇〇万円（税別）\n支払期日: 納品月の翌月末日",
        law_reference: "フリーランス新法第3条第7号",
    },
];

/**
 * 7項目チェック結果
 */
export interface Art3CheckResult {
    items: Array<{
        item: Art3Item;
        found: boolean;
        matched_text?: string;
    }>;
    summary: {
        total: number;
        found: number;
        missing: number;
        compliance_rate: number;  // 0-100
    };
    overall_status: "compliant" | "partial" | "non_compliant";
}

/**
 * フリーランス新法第3条の7項目をチェック
 */
export function checkFreelanceLawArt3(text: string): Art3CheckResult {
    const results: Art3CheckResult["items"] = [];

    for (const item of FREELANCE_LAW_ART3_ITEMS) {
        let found = false;
        let matchedText: string | undefined;

        for (const pattern of item.detection_patterns) {
            const match = text.match(pattern);
            if (match) {
                found = true;
                // コンテキストを含めて抽出（前後50文字）
                const start = Math.max(0, match.index! - 30);
                const end = Math.min(text.length, match.index! + match[0].length + 30);
                matchedText = text.substring(start, end).trim();
                break;
            }
        }

        results.push({
            item,
            found,
            matched_text: matchedText,
        });
    }

    const found = results.filter(r => r.found).length;
    const missing = results.filter(r => !r.found).length;
    const complianceRate = Math.round((found / FREELANCE_LAW_ART3_ITEMS.length) * 100);

    let overallStatus: Art3CheckResult["overall_status"];
    if (missing === 0) {
        overallStatus = "compliant";
    } else if (missing <= 2) {
        overallStatus = "partial";
    } else {
        overallStatus = "non_compliant";
    }

    return {
        items: results,
        summary: {
            total: FREELANCE_LAW_ART3_ITEMS.length,
            found,
            missing,
            compliance_rate: complianceRate,
        },
        overall_status: overallStatus,
    };
}

/**
 * 欠落している項目のみを取得
 */
export function getMissingArt3Items(text: string): Art3Item[] {
    const result = checkFreelanceLawArt3(text);
    return result.items
        .filter(r => !r.found)
        .map(r => r.item);
}

/**
 * 簡易コンプライアンスチェック
 */
export function isArt3Compliant(text: string): boolean {
    const result = checkFreelanceLawArt3(text);
    return result.overall_status === "compliant";
}
