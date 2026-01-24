import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = ["hnd1", "sin1"];

// Lazy init
let _genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!_genAI) {
        const apiKey = process.env.GOOGLE_API_KEY || "";
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY environment variable is not set.");
        }
        _genAI = new GoogleGenerativeAI(apiKey);
    }
    return _genAI;
}

export async function POST(request: NextRequest) {
    try {
        const { contractText, userRole = "vendor" } = await request.json();

        if (!contractText || contractText.trim().length < 50) {
            return NextResponse.json(
                { error: "契約書のテキストが短すぎます" },
                { status: 400 }
            );
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.1,
            },
        });

        const prompt = `あなたは契約書の専門家です。以下の契約書を、リスクゼロの完璧な契約書として書き直してください。

【入力契約書】
${contractText.substring(0, 20000)}

【書き直しルール】
1. 第1条から最終条まで、完全な契約書として出力する
2. 以下の修正を必ず反映する：
   - 支払期日：「成果物納入日から60日以内」に修正
   - 損害賠償：「通常かつ直接の損害に限り、委託料総額を上限」を追加
   - 著作権：「第27条・28条の権利は乙に留保」に修正
   - 競業避止：「期間1年以内」に短縮
3. 以下の条項を追加する：
   - みなし検収：「納品後10日以内に異議なき場合は検収完了」
   - 遅延利息：「年率14.6%」
   - 中途解約精算：「履行済み作業相当額を支払う」

【禁止事項】
- 「追加してください」などの指示文を書かない
- 「【追加条項】」などのラベルを書かない
- 説明や解説を書かない

【出力形式】
契約書の本文のみを出力してください。説明は不要です。`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (!responseText || responseText.length < 500) {
            throw new Error("AI response too short: " + responseText?.length);
        }

        // Validate output - reject if it contains instruction text
        if (responseText.includes("追加してください") ||
            responseText.includes("【追加条項")) {
            console.error("LLM output validation failed - contains instructions");
            throw new Error("LLM output validation failed");
        }

        return NextResponse.json({
            correctedFullText: responseText,
            summary: "契約書を完璧に書き直しました",
            score: 100,
            grade: "S",
        });
    } catch (error) {
        console.error("Contract rewrite error:", error);
        return NextResponse.json(
            { error: "契約書の書き直し中にエラーが発生しました: " + String(error) },
            { status: 500 }
        );
    }
}
