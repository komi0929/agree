import OpenAI from "openai";
import { z } from "zod";
import { UserContext, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { determineApplicableLaws, ApplicableLaws } from "@/lib/legal/law-applicability";
import { ClauseTag, ViolatedLaw } from "@/lib/types/clause-tags";

// 遅延初期化でOpenAIクライアントを作成（サーバーサイドでのみ使用される）
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
    if (!_openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY environment variable is not set. Please configure it in Vercel.");
        }
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _openai;
}

// ============================================
// Schemas
// ============================================

const ExtractionSchema = z.object({
    party_a: z.string().describe("甲の名称（正式名称）"),
    party_b: z.string().describe("乙の名称（正式名称）"),
    contract_type: z.string().describe("契約書の種類（例：業務委託契約書、秘密保持契約書）"),
    estimated_contract_months: z.number().nullable().describe("推定される契約期間（月数）。不明な場合はnull"),
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;

const NegotiationMessageSchema = z.object({
    formal: z.string(),
    neutral: z.string(),
    casual: z.string(),
});

const EnhancedRiskSchema = z.object({
    // 条項分類タグ
    clause_tag: z.enum([
        "CLAUSE_SCOPE", "CLAUSE_PAYMENT", "CLAUSE_ACCEPTANCE", "CLAUSE_IP",
        "CLAUSE_LIABILITY", "CLAUSE_TERM", "CLAUSE_TERMINATION", "CLAUSE_NON_COMPETE",
        "CLAUSE_JURISDICTION", "CLAUSE_CONFIDENTIAL", "CLAUSE_HARASSMENT",
        "CLAUSE_REDELEGATE", "CLAUSE_INVOICE", "CLAUSE_OTHER"
    ]),

    section_title: z.string(),
    original_text: z.string(),

    // リスクレベル（4段階）
    risk_level: z.enum(["critical", "high", "medium", "low"]),

    // 違反の可能性がある法律
    violated_laws: z.array(z.enum([
        "freelance_new_law_art3", "freelance_new_law_art4", "freelance_new_law_art5",
        "freelance_new_law_art12", "freelance_new_law_art13",
        "subcontract_act", "civil_code_conformity", "copyright_art27_28",
        "disguised_employment", "antitrust_underpayment", "public_order"
    ])),

    explanation: z.string(),

    // 具体的な実害（例：「ポートフォリオに載せられなくなる可能性があります」）
    practical_impact: z.string().optional(),

    suggestion: z.object({
        revised_text: z.string(),
        negotiation_message: NegotiationMessageSchema,
        // 法的根拠
        legal_basis: z.string(),
    }),
});

const EnhancedAnalysisSchema = z.object({
    summary: z.string(),
    risks: z.array(EnhancedRiskSchema),
    // 契約類型の判定
    contract_classification: z.enum(["ukeoi", "jun_inin_hourly", "jun_inin_result", "mixed", "unknown"]),
    // 重要な欠落項目
    missing_clauses: z.array(z.string()),
});

export type EnhancedAnalysisResult = z.infer<typeof EnhancedAnalysisSchema>;

// 後方互換性のため
export type AnalysisResult = EnhancedAnalysisResult;

// ============================================
// System Prompts
// ============================================

function buildEnhancedSystemPrompt(ctx: UserContext, laws: ApplicableLaws): string {
    const userRoleJa = ctx.userRole === "vendor" ? "受注者（フリーランス）" : "発注者";

    let lawContext = "";
    if (laws.freelanceNewLawStrict) {
        lawContext += `
【フリーランス新法（厳格規定）が適用されます】
- 第3条：取引条件の明示義務
- 第4条：60日以内の支払期日規制（重要！）
- 第5条：禁止行為（受領拒否、報酬減額、返品、購入強制等）
- 第12条：ハラスメント対策義務
- 第13条：育児・介護への配慮義務（6ヶ月以上の契約）
`;
    } else if (laws.freelanceNewLaw) {
        lawContext += `
【フリーランス新法（基本規定）が適用されます】
- 第3条：取引条件の明示義務
`;
    }

    if (laws.subcontractAct) {
        lawContext += `
【下請法も適用される可能性があります】
- 書面交付義務
- 支払遅延利息（年14.6%）
- 60日以内の支払義務
`;
    }

    return `あなたは日本法に精通した契約書リスク解析AIです。フリーランス・個人事業主を保護するために開発されました。

【ユーザー情報】
- 立場：${userRoleJa}
- 視点：${ctx.userRole === "vendor" ? "ユーザーにとって不利な条項を指摘" : "法令遵守の観点から問題点を指摘"}

${lawContext}

【最重要チェック項目 - これらは必ず確認してください】

★1. 支払期日（60日ルール）- フリーランス新法第4条
   - 「受領日（納品日）」から起算して60日以内に支払われるか
   - 【重要】「検収完了日」ではなく「納品日」が起算点
   - 違反例：「検収完了の翌月末払い」（検収に20日かかると合計80日になる）
   - 「翌々月末払い」は明確な違反の可能性が高い
   - risk_level: critical を設定

★2. 著作権の移転（27条・28条の特掲）- 著作権法第61条第2項
   - 「すべての著作権を譲渡」だけでは27条・28条は移転しない法律上の特則がある
   - 第27条：翻訳権・翻案権（改変する権利）
   - 第28条：二次的著作物の利用権（続編・派生版を作る権利）
   - 【受注者の場合】特掲がないと「実は権利が残っている」可能性がある（有利）
   - 【発注者の場合】特掲がないと「改変できない」リスクがある（不利）
   - risk_level: high を設定

★3. 損害賠償の上限
   - 「一切の損害を賠償する」は青天井リスク（critical）
   - 上限規定がない場合は必ず指摘
   - 推奨：「過去〇ヶ月の報酬総額を上限」

★4. 禁止行為 - フリーランス新法第5条
   - 受領拒否：「都合により受領を拒否できる」→ 違法
   - 報酬減額：「予算の都合により減額する場合がある」→ 違法
   - 返品：「必要ないと判断した場合は返品できる」→ 違法
   - 購入強制：「指定のツールを契約すること」→ 違法の可能性

★5. 偽装請負リスク
   以下が複数該当する場合は「偽装請負（実質的な雇用）」の可能性を警告:
   - 指揮命令：「甲の指示に従い」「甲の監督の下」
   - 時間拘束：「9時〜18時」「所定労働時間」
   - 場所拘束：「甲の本社にて」「指定場所で常駐」
   - 代替性なし：「第三者に再委託してはならない」

★6. 競業避止義務
   - 期間が1年超：無効リスク高（公序良俗違反）
   - 対象が広範：「競合他社すべて」→ 無効リスク
   - 対価なし：代償がなければ無効の可能性

【欠落チェック - 条項が「存在しない」ことも問題】
以下が契約書に含まれていない場合、missing_clauses に追加:
- 支払期日の明確な規定
- 損害賠償の上限規定
- 著作権の帰属に関する規定
- 契約解除の条件

【契約類型の判定】
- ukeoi：請負（成果物の完成が目的）
- jun_inin_hourly：準委任・履行割合型（時間・工数ベース）
- jun_inin_result：準委任・成果完成型
- mixed：混合契約
- unknown：判別不能

【重要：出力形式】
以下の形式で必ずJSONを出力してください：
{
  "summary": "契約書全体の要約と主なリスクの概要（2-3文で）",
  "contract_classification": "ukeoi | jun_inin_hourly | jun_inin_result | mixed | unknown",
  "risks": [
    {
      "clause_tag": "CLAUSE_PAYMENT | CLAUSE_IP | CLAUSE_LIABILITY | CLAUSE_SCOPE | CLAUSE_TERMINATION | CLAUSE_NON_COMPETE | CLAUSE_OTHER",
      "section_title": "条項のタイトル（例：第4条 支払条件）",
      "original_text": "【最重要】問題がある箇所の原文を『完全に一致する形式』で20〜80文字程度で抜粋。ハイライト表示に使用するため、改行や空白も含め正確に。長すぎるとハイライトが埋もれるため、核心部分のみを抽出してください。",
      "risk_level": "critical | high | medium | low",
      "violated_laws": ["該当する法律のコード"],
      "explanation": "なぜこの条項にリスクがあるのかの説明",
      "practical_impact": "【重要】具体的な実害を平易な言葉で説明（例：「ポートフォリオに載せられなくなる」「2ヶ月間報酬が入らない可能性がある」）",
      "suggestion": {
        "revised_text": "修正案の文面",
        "negotiation_message": {
          "formal": "フォーマルな交渉メッセージ",
          "neutral": "ニュートラルな交渉メッセージ",
          "casual": "カジュアルな交渉メッセージ"
        },
        "legal_basis": "法的根拠の説明"
      }
    }
  ],
  "missing_clauses": ["欠落している重要条項のリスト"]
}

【original_textに関する注意事項】
- 契約書本文から、問題のある箇所を『一言一句違わずに』コピー＆ペーストしてください。
- ユーザーはこの原文を元に契約書内の場所を特定します。不正確だとハイライトが表示されません。
- 条項全体を抜き出すのではなく、問題の核心となっている1〜2文程度に絞ってください。`;
}

// ============================================
// API Functions
// ============================================

export async function extractContractParties(text: string): Promise<ExtractionResult> {
    // Check if text is valid
    if (!text || text.trim().length < 50) {
        // Return fallback for very short/empty text
        return {
            party_a: "不明",
            party_b: "不明",
            contract_type: "不明",
            estimated_contract_months: null,
        };
    }

    try {
        const completion = await getOpenAIClient().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `契約書のテキストから以下を抽出し、必ず以下のJSON形式で返答してください：
{
  "party_a": "甲の名称（正式名称）。不明な場合は「不明」",
  "party_b": "乙の名称（正式名称）。不明な場合は「不明」",
  "contract_type": "契約書の種類（例：業務委託契約書）。不明な場合は「契約書」",
  "estimated_contract_months": 数値またはnull
}

重要：必ず上記のキー名を使用してください。`,
                },
                {
                    role: "user",
                    content: text.substring(0, 8000), // Limit text length
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Failed to extract parties");

        const parsed = JSON.parse(content);

        // Provide fallbacks for missing fields
        const result: ExtractionResult = {
            party_a: parsed.party_a || parsed.partyA || parsed["甲"] || "不明",
            party_b: parsed.party_b || parsed.partyB || parsed["乙"] || "不明",
            contract_type: parsed.contract_type || parsed.contractType || parsed["契約種類"] || "契約書",
            estimated_contract_months: typeof parsed.estimated_contract_months === "number"
                ? parsed.estimated_contract_months
                : null,
        };

        return result;
    } catch (error) {
        console.error("Extraction error:", error);
        // Return fallback on any error
        return {
            party_a: "不明",
            party_b: "不明",
            contract_type: "契約書",
            estimated_contract_months: null,
        };
    }
}

export async function analyzeContractText(
    text: string,
    userContext: UserContext = DEFAULT_USER_CONTEXT
): Promise<EnhancedAnalysisResult> {
    // Fallback result for errors
    const fallbackResult: EnhancedAnalysisResult = {
        summary: "契約書の解析に問題が発生しました。再度お試しいただくか、別のファイルでお試しください。",
        risks: [],
        contract_classification: "unknown",
        missing_clauses: [],
    };

    try {
        // Check if text is valid
        if (!text || text.trim().length < 100) {
            return {
                ...fallbackResult,
                summary: "契約書のテキストが短すぎるか、読み取れませんでした。",
            };
        }

        // 適用法規を決定
        const applicableLaws = determineApplicableLaws(userContext);

        // 動的プロンプトを生成
        const systemPrompt = buildEnhancedSystemPrompt(userContext, applicableLaws);

        const completion = await getOpenAIClient().chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt + "\n\n必ずJSON形式で返答してください。",
                },
                {
                    role: "user",
                    content: text.substring(0, 15000), // Limit to avoid token limits
                },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            console.error("AI returned empty content");
            return fallbackResult;
        }

        const parsed = JSON.parse(content);

        // Manually construct result with fallbacks for each field
        const result: EnhancedAnalysisResult = {
            summary: parsed.summary || "解析結果のサマリーを取得できませんでした。",
            risks: Array.isArray(parsed.risks) ? parsed.risks.map((r: any) => ({
                clause_tag: r.clause_tag || "CLAUSE_OTHER",
                section_title: r.section_title || "不明な条項",
                original_text: r.original_text || "",
                risk_level: r.risk_level || "medium",
                violated_laws: Array.isArray(r.violated_laws) ? r.violated_laws : [],
                explanation: r.explanation || "",
                practical_impact: r.practical_impact || undefined,
                suggestion: r.suggestion || {
                    revised_text: "",
                    negotiation_message: { formal: "", neutral: "", casual: "" },
                    legal_basis: "",
                },
            })) : [],
            contract_classification: parsed.contract_classification || "unknown",
            missing_clauses: Array.isArray(parsed.missing_clauses) ? parsed.missing_clauses : [],
        };

        return result;
    } catch (error) {
        console.error("Contract analysis error:", error);
        return fallbackResult;
    }
}

