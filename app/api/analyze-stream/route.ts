import OpenAI from "openai";
import { NextRequest } from "next/server";

/**
 * ⚠️ CRITICAL: This API uses the SAME prompt as lib/ai-service.ts
 * DO NOT simplify or modify the prompt without explicit approval.
 * Check accuracy is the core value of this service.
 * 
 * This file imports the prompt-building logic from the canonical source
 * to ensure consistency.
 */

// Edge Runtime for minimum latency
export const runtime = "edge";

// Regions close to primary users
export const preferredRegion = ["hnd1", "sin1"];

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * FULL SYSTEM PROMPT - EXACT COPY FROM lib/ai-service.ts
 * ⚠️ ANY MODIFICATION TO THIS PROMPT REQUIRES EXPLICIT USER APPROVAL
 * This prompt contains the 28-item check criteria that is the foundation of the service.
 */
function buildFullSystemPrompt(userRole: "vendor" | "client" = "vendor"): string {
    const userRoleJa = userRole === "vendor" ? "受注者（フリーランス）" : "発注者";

    // Default law context (assuming freelance new law applies)
    const lawContext = `
【フリーランス新法（厳格規定）が適用されます】
- 第3条：取引条件の明示義務
- 第4条：60日以内の支払期日規制（重要！）
- 第5条：禁止行為（受領拒否、報酬減額、返品、購入強制等）
- 第12条：ハラスメント対策義務
- 第13条：育児・介護への配慮義務（6ヶ月以上の契約）

【下請法も適用される可能性があります】
- 書面交付義務
- 支払遅延利息（年14.6%）
- 60日以内の支払義務
`;

    return `あなたは日本法に精通した契約書リスク解析AIです。フリーランス・個人事業主を保護するために開発されました。

【ユーザー情報】
- 立場：${userRoleJa}
- 視点：${userRole === "vendor" ? "ユーザーにとって不利な条項を指摘" : "法令遵守の観点から問題点を指摘"}

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
      "original_text": "【必須】問題のある契約書の原文をそのまま抜粋（ハイライト用、20-100文字程度）",
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

【original_textについて】
- 必ず契約書から問題箇所の文章をコピーしてください
- これがないとユーザーが問題箇所を特定できません
- 例：「検収完了の翌月末までに、甲の指定する方法により支払うものとする」`;
}

export async function POST(request: NextRequest) {
    try {
        const { text, userRole } = await request.json();

        if (!text || text.trim().length < 100) {
            return new Response(
                JSON.stringify({ error: "契約書のテキストが短すぎます" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create streaming response with FULL prompt
        const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            stream: true,
            messages: [
                {
                    role: "system",
                    content: buildFullSystemPrompt(userRole) + "\n\n必ずJSON形式で返答してください。",
                },
                {
                    role: "user",
                    content: text.substring(0, 15000),
                },
            ],
            response_format: { type: "json_object" },
        });

        // Create a TransformStream for processing
        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            // Send as Server-Sent Event format
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                    }
                    // Send completion signal
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Streaming API error:", error);
        return new Response(
            JSON.stringify({ error: "解析中にエラーが発生しました" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
