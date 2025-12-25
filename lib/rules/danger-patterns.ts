// lib/rules/danger-patterns.ts
// 危険パターンの正規表現定義
// 
// [精度向上ログ: 2024-12-25]
// 意図: LLMが見逃す可能性のある確定的リスクを100%検知する
// 設計判断: 見逃しより誤検知の方が安全なため、パターンは緩めに設定

import { ViolatedLaw } from "@/lib/types/clause-tags";

export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface DangerPattern {
    id: string;
    pattern: RegExp;
    risk: RiskLevel;
    law: ViolatedLaw;
    title: string;
    explanation: string;
    note?: string;
}

/**
 * 危険パターン定義
 * 
 * カテゴリ:
 * - payment: 支払遅延リスク（フリーランス新法第4条）
 * - liability: 損害賠償リスク
 * - prohibited: 禁止行為（フリーランス新法第5条）
 * - copyright: 著作権リスク
 * - employment: 偽装請負リスク
 * - non_compete: 競業避止リスク
 */
export const DANGER_PATTERNS: Record<string, DangerPattern[]> = {
    // ========================================
    // 支払遅延リスク（フリーランス新法第4条）
    // 納品日から60日以内に支払わなければ違法
    // ========================================
    payment: [
        {
            id: "payment_001",
            pattern: /翌々月末/,
            risk: "critical",
            law: "freelance_new_law_art4",
            title: "60日ルール違反の可能性",
            explanation: "翌々月末払いは、納品日から最長90日程度かかる可能性があり、フリーランス新法第4条（60日以内の支払義務）に違反する可能性が極めて高いです。",
        },
        {
            id: "payment_002",
            pattern: /90日|９０日/,
            risk: "critical",
            law: "freelance_new_law_art4",
            title: "60日ルール違反",
            explanation: "90日の支払期間は、フリーランス新法第4条（60日以内の支払義務）に明確に違反します。",
        },
        {
            id: "payment_003",
            pattern: /検収.*から.*60日|検収完了.*60日/,
            risk: "high",
            law: "freelance_new_law_art4",
            title: "起算点のすり替えリスク",
            explanation: "フリーランス新法では「納品日」が起算点です。「検収完了日」を起算点とすると、検収期間分だけ支払が遅れ、60日を超過する可能性があります。",
            note: "検収期間が10-20日の場合、実質70-80日になる",
        },
        {
            id: "payment_004",
            pattern: /検収.*翌月末/,
            risk: "high",
            law: "freelance_new_law_art4",
            title: "60日超過の可能性",
            explanation: "検収完了後の翌月末払いは、検収期間を含めると60日を超過する可能性があります。",
        },
    ],

    // ========================================
    // 損害賠償リスク
    // 上限がないと報酬を大幅に超える賠償リスク
    // ========================================
    liability: [
        {
            id: "liability_001",
            pattern: /一切の損害.*賠償|一切.*損害.*負担/,
            risk: "critical",
            law: "civil_code_conformity",
            title: "無制限の損害賠償責任",
            explanation: "「一切の損害を賠償」という文言は、損害賠償に上限がなく、報酬額を大幅に超える賠償を請求される可能性があります。",
        },
        {
            id: "liability_002",
            pattern: /全額.*賠償|損害.*全額/,
            risk: "critical",
            law: "civil_code_conformity",
            title: "全額賠償条項",
            explanation: "全額賠償の規定は、予期せぬ大きな損害が発生した場合のリスクが非常に高いです。",
        },
        {
            id: "liability_003",
            pattern: /損害賠償.*上限.*(?:設けない|なし|ない)/,
            risk: "critical",
            law: "civil_code_conformity",
            title: "賠償上限なしの明記",
            explanation: "損害賠償の上限を設けないことが明記されています。これは受注者にとって極めて危険です。",
        },
        {
            id: "liability_004",
            pattern: /逸失利益.*含む|間接損害.*含む/,
            risk: "high",
            law: "civil_code_conformity",
            title: "逸失利益・間接損害の賠償",
            explanation: "逸失利益や間接損害は金額が膨らみやすく、予測不能なリスクがあります。除外を交渉すべきです。",
        },
    ],

    // ========================================
    // 禁止行為（フリーランス新法第5条）
    // ========================================
    prohibited: [
        {
            id: "prohibited_001",
            pattern: /(?:都合|理由).*(?:により|によって).*受領.*拒否/,
            risk: "critical",
            law: "freelance_new_law_art5",
            title: "受領拒否条項",
            explanation: "発注者の都合による受領拒否は、フリーランス新法第5条で明確に禁止されています。",
        },
        {
            id: "prohibited_002",
            pattern: /予算.*(?:都合|理由).*減額|事後.*減額/,
            risk: "critical",
            law: "freelance_new_law_art5",
            title: "一方的な報酬減額",
            explanation: "発注後に予算の都合等で報酬を減額することは、フリーランス新法第5条で禁止されています。",
        },
        {
            id: "prohibited_003",
            pattern: /(?:必要.*ない|不要).*(?:判断|場合).*返品/,
            risk: "critical",
            law: "freelance_new_law_art5",
            title: "不当な返品条項",
            explanation: "発注者の都合による返品は、フリーランス新法第5条で禁止されています。",
        },
        {
            id: "prohibited_004",
            pattern: /(?:指定.*(?:ツール|サービス|商品)).*(?:契約|購入|利用).*(?:すること|義務)/,
            risk: "high",
            law: "freelance_new_law_art5",
            title: "購入・利用強制の可能性",
            explanation: "正当な理由なく指定の商品やサービスの購入を強制することは、フリーランス新法第5条で禁止されています。",
        },
    ],

    // ========================================
    // 著作権リスク
    // ========================================
    copyright: [
        {
            id: "copyright_001",
            pattern: /著作(?:権|物).*(?:すべて|一切|全て).*譲渡/,
            risk: "high",
            law: "copyright_art27_28",
            title: "著作権の完全譲渡",
            explanation: "著作権の完全譲渡には注意が必要です。著作権法第61条第2項により、第27条（翻案権）と第28条（二次的著作物の利用権）は特掲しないと移転しません。",
        },
        {
            id: "copyright_002",
            pattern: /著作者人格権.*(?:行使しない|放棄|不行使)/,
            risk: "medium",
            law: "copyright_art27_28",
            title: "著作者人格権の不行使",
            explanation: "著作者人格権の不行使条項があります。ポートフォリオへの掲載権などを確保したい場合は交渉が必要です。",
        },
    ],

    // ========================================
    // 偽装請負リスク
    // 複数該当で高リスク
    // ========================================
    employment: [
        {
            id: "employment_001",
            pattern: /甲の指示に従い|甲の指揮.*命令/,
            risk: "high",
            law: "disguised_employment",
            title: "指揮命令権の存在",
            explanation: "「甲の指示に従い」という文言は、雇用関係の特徴である指揮命令権を示唆します。偽装請負と判断されるリスクがあります。",
        },
        {
            id: "employment_002",
            pattern: /甲の監督の下|監督.*指導/,
            risk: "high",
            law: "disguised_employment",
            title: "監督下での業務",
            explanation: "発注者の監督下で業務を行う規定は、雇用関係の特徴です。",
        },
        {
            id: "employment_003",
            pattern: /[0-9０-９]+時.*[0-9０-９]+時|9[時:].*18[時:]/,
            risk: "medium",
            law: "disguised_employment",
            title: "勤務時間の拘束",
            explanation: "具体的な勤務時間の指定は、雇用関係の特徴です。",
        },
        {
            id: "employment_004",
            pattern: /常駐|出社.*義務|甲の(?:事務所|オフィス|本社).*にて/,
            risk: "medium",
            law: "disguised_employment",
            title: "勤務場所の拘束",
            explanation: "特定の場所での常駐義務は、雇用関係の特徴です。",
        },
        {
            id: "employment_005",
            pattern: /再委託.*(?:禁止|できない|してはならない)|第三者.*委託.*(?:禁止|できない)/,
            risk: "medium",
            law: "disguised_employment",
            title: "再委託の禁止",
            explanation: "再委託の完全禁止は、労働者性を示す要素の一つです。",
        },
    ],

    // ========================================
    // 競業避止リスク
    // [精度向上ログ: 2024-12-25] 項目07対応
    // ========================================
    non_compete: [
        {
            id: "non_compete_001",
            pattern: /競業(?:避止|禁止).*[2-9]年|[2-9]年間.*競業/,
            risk: "high",
            law: "public_order",
            title: "長期の競業避止義務",
            explanation: "2年以上の競業避止義務は、公序良俗違反で無効となる可能性が高いです。",
        },
        {
            id: "non_compete_002",
            pattern: /競合(?:他社|企業).*一切|すべて.*競合/,
            risk: "high",
            law: "public_order",
            title: "広範な競業禁止",
            explanation: "競合他社すべてとの取引禁止は、範囲が広すぎて無効となる可能性があります。",
        },
        {
            id: "non_compete_003",
            pattern: /契約終了後.*[1-9]年間.*類似業務/,
            risk: "high",
            law: "public_order",
            title: "類似業務の長期禁止",
            explanation: "契約終了後の類似業務禁止は、職業選択の自由を侵害する可能性があります。削除または「本件機密情報を利用する場合に限る」と限定を交渉してください。",
        },
    ],

    // ========================================
    // 業務範囲リスク（スコープクリープ）
    // [精度向上ログ: 2024-12-25] 項目06対応
    // ========================================
    scope: [
        {
            id: "scope_001",
            pattern: /その他.*甲.*指示.*(?:一切|すべて).*業務/,
            risk: "high",
            law: "freelance_new_law_art3",
            title: "業務範囲の無制限拡大",
            explanation: "「その他甲が指示する一切の業務」は、無限に追加作業を求められるリスクがあります。「仕様書に定める業務に限る」とし、追加業務は別途見積もりとするよう交渉してください。",
        },
        {
            id: "scope_002",
            pattern: /(?:これに|これらに).*付随.*業務|関連.*(?:一切|すべて).*業務/,
            risk: "medium",
            law: "freelance_new_law_art3",
            title: "付随業務の曖昧な定義",
            explanation: "「付随する業務」は範囲が曖昧で、追加作業を押し付けられるリスクがあります。具体的に列挙するか、追加は別途見積もりとする規定を追加してください。",
        },
    ],

    // ========================================
    // 契約不適合責任リスク
    // [精度向上ログ: 2024-12-25] 項目08対応
    // ========================================
    conformity: [
        {
            id: "conformity_001",
            pattern: /契約不適合.*(?:1年|一年|12ヶ月|12か月)/,
            risk: "high",
            law: "civil_code_conformity",
            title: "契約不適合責任期間が長すぎます",
            explanation: "納品後1年間の契約不適合責任は長すぎます。「検収後3ヶ月（長くても6ヶ月）」に短縮を交渉してください。",
        },
        {
            id: "conformity_002",
            pattern: /瑕疵担保.*(?:1年|一年|期間.*(?:定め|なし))/,
            risk: "high",
            law: "civil_code_conformity",
            title: "瑕疵担保責任期間に注意",
            explanation: "瑕疵担保責任の期間が長いまたは不明確です。「検収後3ヶ月」程度に短縮を交渉してください。",
        },
    ],

    // ========================================
    // 裁判管轄リスク
    // [精度向上ログ: 2024-12-25] 項目09対応
    // ========================================
    jurisdiction: [
        {
            id: "jurisdiction_001",
            pattern: /甲の(?:本店|本社).*所在地.*(?:裁判所|管轄)/,
            risk: "medium",
            law: "civil_code_conformity",
            title: "裁判管轄が発注者有利",
            explanation: "裁判管轄が発注者の所在地に固定されています。トラブル時に遠方の裁判所まで出向く必要があります。「被告の住所地」または「乙の住所地」への変更を交渉してください。",
        },
        {
            id: "jurisdiction_002",
            pattern: /(?:東京|大阪).*(?:地方裁判所|地裁).*(?:専属|のみ)/,
            risk: "low",
            law: "civil_code_conformity",
            title: "裁判管轄が大都市に固定",
            explanation: "裁判管轄が東京や大阪などの大都市に固定されています。あなたの所在地によっては不利になる可能性があります。",
        },
    ],

    // ========================================
    // AI学習利用リスク
    // [精度向上ログ: 2024-12-25] 項目11対応
    // ========================================
    ai_usage: [
        {
            id: "ai_usage_001",
            pattern: /成果物.*(?:AI|機械学習|学習|データ).*(?:利用|活用|使用)/,
            risk: "medium",
            law: "copyright_art27_28",
            title: "成果物のAI学習利用リスク",
            explanation: "成果物がAI学習に利用される可能性があります。クリエイティブ系の成果物の場合、「AI学習への利用を禁止」と明記することを検討してください。",
        },
    ],

    // ========================================
    // 検収起算日リスク
    // [精度向上ログ: 2024-12-25] 項目02対応
    // ========================================
    acceptance: [
        {
            id: "acceptance_001",
            pattern: /検査.*合格.*(?:日|後).*(?:支払|起算)/,
            risk: "high",
            law: "freelance_new_law_art4",
            title: "支払起算点が「検査合格日」",
            explanation: "支払いの起算点が「検査合格日」になっています。フリーランス新法では「納品日（受領日）」が起算点です。検査遅延による支払遅れを防ぐため、「納品日」を起算点に変更してください。",
        },
        {
            id: "acceptance_002",
            pattern: /検収.*完了.*(?:翌月|から)/,
            risk: "high",
            law: "freelance_new_law_art4",
            title: "支払起算点が「検収完了」",
            explanation: "支払いの起算点が「検収完了日」になっています。検収が遅れると支払いも遅れます。「納品日から60日以内」への変更を交渉してください。",
        },
    ],
};

/**
 * 全パターンをフラット化して取得
 */
export function getAllDangerPatterns(): DangerPattern[] {
    return Object.values(DANGER_PATTERNS).flat();
}

/**
 * テキストに対して全パターンをチェック
 */
export function checkDangerPatterns(text: string): DangerPattern[] {
    const matches: DangerPattern[] = [];

    for (const pattern of getAllDangerPatterns()) {
        if (pattern.pattern.test(text)) {
            matches.push(pattern);
        }
    }

    return matches;
}
