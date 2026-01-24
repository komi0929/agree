import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { UserContext, DEFAULT_USER_CONTEXT } from "@/lib/types/user-context";
import { determineApplicableLaws, ApplicableLaws } from "@/lib/legal/law-applicability";
import { ClauseTag, ViolatedLaw } from "@/lib/types/clause-tags";
import { EnhancedAnalysisResult, AnalysisResult } from "@/lib/types/analysis";

// Re-export for backward compatibility
export type { EnhancedAnalysisResult, AnalysisResult };

// 遅延初期化でGeminiライアントを作成
let _genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!_genAI) {
        // Fallback to OPENAI_API_KEY if GOOGLE_API_KEY is not set (for transitions)
        // detailed check for GOOGLE_API_KEY
        if (!process.env.GOOGLE_API_KEY) {
            console.warn("GOOGLE_API_KEY is not set. Trying OPENAI_API_KEY as fallback (might fail if not compatible).");
        }
        const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable is not set.");
        }
        _genAI = new GoogleGenerativeAI(apiKey);
    }
    return _genAI;
}

// ============================================
// Schemas
// ============================================

const ExtractionSchema = z.object({
    party_a: z.string().describe("甲の名称（正式名称）"),
    party_b: z.string().describe("乙の名称（正式名称）"),
    contract_type: z.string().describe("契約書の種類（例：業務委託契約書、秘密保持契約書）"),
    estimated_contract_months: z.number().nullable().describe("推定される契約期間（月数）。不明な場合はnull"),
    client_party: z.enum(["party_a", "party_b", "unknown"]).describe("どちらが「発注者（クライアント/支払う側）」か。不明な場合はunknown"),
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

// ============================================
// System Prompts
// ============================================

function buildEnhancedSystemPrompt(ctx: UserContext, laws: ApplicableLaws): string {
    const userRoleJa = ctx.userRole === "vendor" ? "受注者（フリーランス）" : "発注者";
    const contractRoleJa = ctx.contractRole === "party_a" ? "甲" : ctx.contractRole === "party_b" ? "乙" : "不明";

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

    return `あなたは日本法に精通した「超完璧主義」の契約書修正AI（Gemini 3 Flash）です。
あなたの使命は、入力された契約書を「リスクゼロ（100点満点）」の「完璧な契約書」に作り変えることです。
ユーザーは「修正案の提案」ではなく、「そのまま使える完成した条文」を求めています。

【重要：あなたの役割】
あなたは単なるアドバイザーではありません。「守りの鉄壁」を作る法務担当者です。
発見したリスクに対しては、必ず「リスクを完全に排除した修正案」を提示してください。

【ユーザー情報】
- 立場：${userRoleJa}
- 契約書上の呼称：${contractRoleJa} （${contractRoleJa}にとって有利、または少なくとも公平・安全な条文に書き換えてください）
- 目的：「${ctx.userRole === "vendor" ? "受注者として絶対に損をしない契約" : "発注者としてコンプライアンス遵守かつ安全な契約"}」の作成

${lawContext}

【絶対遵守事項：修正案(revised_text)の作成ルール】
1. **リスクの完全排除**:
   - 曖昧な表現、不利な条件、法的に無効な可能性がある箇所は、すべて「明確かつ安全な条文」に書き換えてください。
   - 「協議の上決定する」といった先送りの表現は、可能な限り具体的な条件（例：30日以内に支払う）に置き換えてください。

2. **100点満点の条文**:
   - 修正後の条文は、一切の法的リスクがなく、ユーザーにとって最大限有利（または完全に公平）なものでなければなりません。
   - この修正案を採用すれば、誰がチェックしても「問題なし（100点）」と言われるレベルにしてください。

3. **「専門家へ相談」の禁止**:
   - 「弁護士に相談してください」「専門家の確認を推奨します」という出力は**禁止**です。
   - あなたが専門家として、責任を持って修正案を断定して出力してください。

4. **具体的で完全な書き換え**:
   - プレースホルダー（例：[ここに金額を入れる]）は極力避け、一般的な適正値（例：損害賠償上限なら「委託料の6ヶ月分」）を提案してください。
   - 文脈から推測できない場合のみ、[***]のような記号を使ってください。

【最重要チェック項目と修正方針】

★1. 支払期日（フリーランス新法第4条・下請法）
   - **修正方針**: 必ず「受領日から60日以内」の具体的な日付（例：受領日の翌月末払い）に修正してください。
   - 「検収完了日」起算になっている場合は「成果物の納入日」起算に書き換えてください。

★2. 著作権の移転（著作権法第27条・28条）
   - **修正方針（受注者側）**: 原則として「著作権は乙（受注者）に留保される」形に修正するか、譲渡する場合でも「特掲なし（27条28条は譲渡しない）」として権利を残してください。ただし、相手方が大手企業等で譲渡が必須と思われる文脈であれば、「対価を支払った場合に限り譲渡する」とし、著作者人格権の不行使特約は削除または限定してください。
   - **修正方針（発注者側）**: 「第27条及び第28条の権利を含むすべての著作権を甲に移転する」と明記し、著作者人格権の不行使も追加してください。

★3. 損害賠償の制限
   - **修正方針**: 「一切の損害」となっている場合は、「通常かつ直接の損害に限り」かつ「本契約に基づき甲が乙に過去6ヶ月間に支払った報酬総額を上限とする」という条文に**必ず**書き換えてください。青天井は絶対に許容しないでください。

★4. 禁止行為・一方的な解除
   - **修正方針**: 「甲の都合で解除できる」「受領拒否できる」といった条項は削除するか、「甲が乙に補償金を支払った場合に限り」などの条件を追加した公平な内容に書き換えてください。

★5. 競業避止義務
   - **修正方針**: 期間・地域・範囲が広すぎる場合は、「本契約の業務と実質的に競合する業務に限り、本契約終了後1年間」のように限定し、かつ「合理的な代償が支払われる場合を除き適用しない」とするか、条項自体を削除する提案（delete扱い）をしてください。

【出力形式】
JSONスキーマに従って出力してください（形式は変更なし）。
ただし、risks配列の中身は「指摘」にとどまらず、「この通り直せば100点になる」という修正案(revised_text)を全ての項目で作成してください。既存の条文で問題がない場合でも、より良くできるなら提案してください。`;
}

// ============================================
// API Functions
// ============================================

export async function extractContractParties(text: string): Promise<ExtractionResult> {
    // Check if text is valid
    if (!text || text.trim().length < 50) {
        return {
            party_a: "不明",
            party_b: "不明",
            contract_type: "不明",
            estimated_contract_months: null,
            client_party: "unknown",
        };
    }

    try {
        const genAI = getGeminiClient();
        // Use Gemini 3 Flash (or latest available 2.0-flash-exp if 3.0 not yet aliased)
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview", // Corrected to actual API model ID
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `
契約書のテキストから以下を抽出し、必ず以下のJSON形式で返答してください：
{
  "party_a": "甲の名称（正式名称）。不明な場合は「不明」",
  "party_b": "乙の名称（正式名称）。不明な場合は「不明」",
  "contract_type": "契約書の種類（例：業務委託契約書）。不明な場合は「契約書」",
  "estimated_contract_months": 数値またはnull,
  "client_party": "party_a" | "party_b" | "unknown" （どちらが発注者/支払う側か）
}

重要：必ず上記のキー名を使用してください。
\n\n契約書テキスト:\n${text.substring(0, 15000)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (!responseText) throw new Error("Failed to extract parties");

        const parsed = JSON.parse(responseText);

        // Provide fallbacks for missing fields
        const resultData: ExtractionResult = {
            party_a: parsed.party_a || parsed.partyA || parsed["甲"] || "不明",
            party_b: parsed.party_b || parsed.partyB || parsed["乙"] || "不明",
            contract_type: parsed.contract_type || parsed.contractType || parsed["契約種類"] || "契約書",
            estimated_contract_months: typeof parsed.estimated_contract_months === "number"
                ? parsed.estimated_contract_months
                : null,
            client_party: parsed.client_party || "unknown",
        };

        return resultData;
    } catch (error) {
        console.error("Extraction error:", error);
        return {
            party_a: "不明",
            party_b: "不明",
            contract_type: "契約書",
            estimated_contract_months: null,
            client_party: "unknown",
        };
    }
}

export async function analyzeContractText(
    text: string,
    userContext: UserContext = DEFAULT_USER_CONTEXT
): Promise<EnhancedAnalysisResult> {
    const fallbackResult: EnhancedAnalysisResult = {
        summary: "契約書の解析に問題が発生しました。",
        risks: [],
        contract_classification: "unknown",
        missing_clauses: [],
    };

    try {
        if (!text || text.trim().length < 100) {
            return {
                ...fallbackResult,
                summary: "契約書のテキストが短すぎるか、読み取れませんでした。",
            };
        }

        const applicableLaws = determineApplicableLaws(userContext);
        const systemPrompt = buildEnhancedSystemPrompt(userContext, applicableLaws);

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json"
            },
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(text.substring(0, 30000)); // Gemini has larger context window
        const responseText = result.response.text();

        if (!responseText) {
            console.error("AI returned empty content");
            return fallbackResult;
        }

        const parsed = JSON.parse(responseText);

        // Manually construct result with fallbacks for each field
        const resultData: EnhancedAnalysisResult = {
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

        return resultData;
    } catch (error) {
        console.error("Contract analysis error:", error);
        return fallbackResult;
    }
}

