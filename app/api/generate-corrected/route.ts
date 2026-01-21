import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { formatContractText, calculateScore, generateDiffId } from "@/lib/text-formatter";
import type { CorrectedContractResult, DiffMetadata } from "@/lib/types/analysis";

export const runtime = "edge";
export const preferredRegion = ["hnd1", "sin1"];

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const SYSTEM_PROMPT = `あなたは日本法に精通した契約書修正AIです。フリーランス・個人事業主を保護するために開発されました。

【タスク】
1. 入力された契約書を分析し、リスクのある条項を特定する
2. 各リスク箇所を修正した「修正済み契約書」を生成する
3. 各修正箇所のメタデータ（Before/After、理由、リスクレベル）を出力する

【重要チェック項目】
- 支払期日：60日ルール（フリーランス新法第4条）
- 著作権移転：27条・28条の特掲
- 損害賠償：上限規定の有無
- 競業避止：期間と対価のバランス
- 偽装請負：指揮命令・時間拘束の有無

【出力形式】
必ず以下のJSON形式で出力してください：
{
  "correctedFullText": "修正済みの契約書全文（改行・インデントを維持）",
  "modifications": [
    {
      "type": "modified | added | deleted",
      "originalText": "元のテキスト（削除の場合のみ）",
      "correctedText": "修正後のテキスト（追記・修正の場合）",
      "reason": "修正の理由（例：60日ルール違反を修正）",
      "riskLevel": "critical | high | medium | low"
    }
  ]
}

【修正ルール】
- 支払期日が60日超 → 「納品日から60日以内」に修正
- 著作権の全移転 → 27条・28条を除外する条項を追記
- 損害賠償上限なし → 「過去6ヶ月の報酬総額を上限」を追記
- 不当な競業避止 → 期間を「1年以内」に修正
- ハラスメント規定なし → 適切な規定を追記`;

export async function POST(request: NextRequest) {
    try {
        const { contractText, userRole = "vendor" } = await request.json();

        if (!contractText || contractText.trim().length < 100) {
            return NextResponse.json(
                { error: "契約書のテキストが短すぎます" },
                { status: 400 }
            );
        }

        // Call OpenAI for contract correction
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: contractText.substring(0, 15000) },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("AI returned empty response");
        }

        const aiResult = JSON.parse(content);

        // Format the corrected text
        const formattedText = formatContractText(aiResult.correctedFullText || contractText);

        // Build diff metadata
        const diffs: DiffMetadata[] = (aiResult.modifications || []).map((mod: any, index: number) => ({
            id: generateDiffId(),
            type: mod.type || "modified",
            startIndex: formattedText.indexOf(mod.correctedText || mod.originalText) || 0,
            endIndex: (formattedText.indexOf(mod.correctedText || mod.originalText) || 0) +
                (mod.correctedText || mod.originalText || "").length,
            originalText: mod.originalText || "",
            correctedText: mod.correctedText || "",
            reason: mod.reason || "リスク軽減のため修正",
            riskLevel: mod.riskLevel || "medium",
        }));

        // Calculate score based on remaining issues
        const { score, grade, breakdown } = calculateScore(
            diffs.map(d => ({ risk_level: d.riskLevel }))
        );

        // Get top 3 risks for score reveal
        const topRisks = diffs
            .filter(d => d.riskLevel === "critical" || d.riskLevel === "high")
            .slice(0, 3)
            .map(d => ({
                title: getShortTitle(d.reason),
                description: d.reason,
                level: d.riskLevel as "critical" | "high" | "medium",
            }));

        const result: CorrectedContractResult = {
            correctedFullText: formattedText,
            diffs,
            score: Math.max(score, 35), // Modified contracts should score higher (at least 35)
            grade,
            breakdown,
            topRisks,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Contract correction error:", error);
        return NextResponse.json(
            { error: "契約書の修正中にエラーが発生しました" },
            { status: 500 }
        );
    }
}

function getShortTitle(reason: string): string {
    // Extract key risk from reason
    if (reason.includes("支払") || reason.includes("60日")) return "支払期日の問題";
    if (reason.includes("著作権") || reason.includes("27条") || reason.includes("28条")) return "著作権の移転リスク";
    if (reason.includes("損害賠償")) return "損害賠償リスク";
    if (reason.includes("競業") || reason.includes("禁止")) return "競業避止の制限";
    if (reason.includes("ハラスメント")) return "ハラスメント規定欠如";
    return "条項のリスク";
}
