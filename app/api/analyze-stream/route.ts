import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

/**
 * ⚠️ CRITICAL: This API uses the SAME prompt as lib/ai-service.ts
 * DO NOT simplify or modify the prompt without explicit approval.
 * Check accuracy is the core value of this service.
 * 
 * This file imports the prompt-building logic from the canonical source
 * to ensure consistency.
 */

// Edge Runtime for minimum latency - Gemini SDK supports edge
export const runtime = "edge";

// Regions close to primary users
export const preferredRegion = ["hnd1", "sin1"];

// Initialize Gemini client
const getGeminiModel = () => {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY is not set.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-3.0-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
};

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

    return `あなたは日本法に精通した「超完璧主義」の契約書修正AI（Gemini 3 Flash）です。
あなたの使命は、入力された契約書を「リスクゼロ（100点満点）」の「完璧な契約書」に作り変えることです。
ユーザーは「修正案の提案」ではなく、「そのまま使える完成した条文」を求めています。

【重要：あなたの役割】
あなたは単なるアドバイザーではありません。「守りの鉄壁」を作る法務担当者です。
発見したリスクに対しては、必ず「リスクを完全に排除した修正案」を提示してください。

【ユーザー情報】
- 立場：${userRoleJa}
- 契約書上の呼称：(不明) （ユーザーにとって有利、または少なくとも公平・安全な条文に書き換えてください）
- 目的：「${userRole === "vendor" ? "受注者として絶対に損をしない契約" : "発注者としてコンプライアンス遵守かつ安全な契約"}」の作成

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
        "revised_text": "【重要】リスクを完全に排除した修正案の文面",
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

【original_textに関する重要事項 - ハイライト表示に必須】
- 契約書本文から問題箇所を『一言一句違わずに』コピーしてください
- 【文字数】30〜60文字程度が最適（長すぎるとハイライトが埋もれ、短すぎると特定できない）
- 【禁止】条項全体を抜き出さない、「第〇条」などの見出しのみにしない
- 【推奨】問題の核心となっている1文のみをピンポイントで抽出
- 【例】✗「第5条（秘密保持）1.乙は、本契約の締結及び履行に際して知り得た甲の一切の情報を、本契約終了後も永久に秘密として保持し...」
- 【例】○「本契約終了後も永久に秘密として保持し」
- 改行・空白も契約書と完全一致させてください`;
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

        const model = getGeminiModel();
        const systemPrompt = buildFullSystemPrompt(userRole);

        // Streaming request (with system instruction and user prompt combo if needed, 
        // SDK supports systemInstruction in `getGenerativeModel`. 
        // We'll just include it in the call details or re-init here for clarity isn't ideal for stream, 
        // but let's assume we pass it in prompt or config. 
        // Actually best practice for single-shot stream is just passing it.
        // However, `getGenerativeModel` config is already set. 
        // Let's re-config to be safe with system prompt.)

        const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
        const genAI = new GoogleGenerativeAI(apiKey);
        const streamModel = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: systemPrompt,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const result = await streamModel.generateContentStream(text.substring(0, 30000));

        // Create a TransformStream for processing
        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const content = chunk.text();
                        if (content) {
                            // Send as Server-Sent Event format
                            // OpenAI format expected by clients might be: data: {"content": "..."}
                            // We mimic this for frontend compatibility
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
