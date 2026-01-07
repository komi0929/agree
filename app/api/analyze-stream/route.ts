import OpenAI from "openai";
import { NextRequest } from "next/server";

// Edge Runtime for minimum latency
export const runtime = "edge";

// Regions close to primary users
export const preferredRegion = ["hnd1", "sin1"];

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// Build system prompt (simplified version for streaming)
function buildSystemPrompt(userRole: "vendor" | "client" = "vendor"): string {
    const userRoleJa = userRole === "vendor" ? "受注者（フリーランス）" : "発注者";

    return `あなたは日本法に精通した契約書リスク解析AIです。

【ユーザー情報】
- 立場：${userRoleJa}
- 視点：${userRole === "vendor" ? "ユーザーにとって不利な条項を指摘" : "法令遵守の観点から問題点を指摘"}

【出力形式】
以下の形式で必ずJSONを出力してください：
{
  "summary": "契約書全体の要約と主なリスクの概要",
  "contract_classification": "ukeoi | jun_inin_hourly | jun_inin_result | mixed | unknown",
  "risks": [
    {
      "clause_tag": "CLAUSE_PAYMENT | CLAUSE_IP | CLAUSE_LIABILITY | ...",
      "section_title": "条項のタイトル",
      "original_text": "問題のある契約書の原文",
      "risk_level": "critical | high | medium | low",
      "violated_laws": ["該当する法律のコード"],
      "explanation": "なぜリスクがあるのか",
      "practical_impact": "具体的な実害",
      "suggestion": {
        "revised_text": "修正案",
        "negotiation_message": { "formal": "", "neutral": "", "casual": "" },
        "legal_basis": "法的根拠"
      }
    }
  ],
  "missing_clauses": ["欠落している重要条項"]
}

【重要チェック項目】
1. 支払期日（60日ルール）
2. 著作権の移転（27条・28条の特掲）
3. 損害賠償の上限
4. 禁止行為（受領拒否、報酬減額等）
5. 偽装請負リスク
6. 競業避止義務`;
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

        // Create streaming response
        const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            stream: true,
            messages: [
                {
                    role: "system",
                    content: buildSystemPrompt(userRole) + "\n\n必ずJSON形式で返答してください。",
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
