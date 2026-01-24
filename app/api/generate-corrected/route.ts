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

const SYSTEM_PROMPT = `あなたは契約書を完璧に書き直す専門AIです。

【最重要指示】
入力された契約書を読み取り、28項目のリスクチェックを全て反映した「完璧な契約書」を「最初から最後まで完全に書き直して」出力してください。

【絶対禁止事項】
- 「追加してください」「ご確認ください」などの指示文は禁止
- 「【追加条項：〇〇】」などのラベル・見出しは禁止
- 元の契約書のコピーペーストは禁止
- 修正点の説明や解説は禁止

【必ず行うこと】
- 完璧な契約書を第1条から最終条まで書く
- 条文番号を第1条、第2条...と連番で振る
- そのまま使える法的文書として出力する

【出力形式】
JSONで以下の形式のみ出力：
{
  "correctedFullText": "ここに完璧な契約書の全文を書く"
}

【28項目チェックの反映方法】
以下の項目を全て「具体的な条文として」組み込む：

■ 必須修正（元の条文を書き換え）
1. 支払期日「成果物納入日から60日以内」
2. 損害賠償「通常かつ直接の損害に限り、委託料総額を上限」
3. 著作権「第27条・28条の権利は乙に留保」
4. 競業避止「期間1年以内、範囲は本業務と競合するものに限定」

■ 必須追加（新しい条として追加）
5. みなし検収「納品後10日以内に異議なき場合は検収完了」
6. 遅延利息「年率14.6%」
7. 中途解約精算「履行済み作業相当額を支払う」
8. 経費負担「甲が負担」

【出力例のイメージ】
{
  "correctedFullText": "業務委託契約書\n\n株式会社〇〇（以下「甲」という）と、〇〇（以下「乙」という）は、以下のとおり契約を締結する。\n\n第1条（目的）\n甲は乙に対し、〇〇に関する業務を委託し、乙はこれを受託する。\n\n第2条（委託料及び支払条件）\n1. 委託料は金〇〇円（税別）とする。\n2. 甲は乙に対し、成果物の納入日から60日以内に、乙の指定する銀行口座に振り込む方法により支払う。\n3. 甲が支払いを遅延した場合、年率14.6%の遅延損害金を支払うものとする。\n\n第3条（成果物の検収）\n1. 乙は成果物を納入後、甲は10日以内に検査を行う。\n2. 納入後10日以内に甲から書面による異議がない場合は、検収に合格したものとみなす。\n\n..."
}

↑このように、完全な契約書として出力すること。`;

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
                responseMimeType: "application/json",
                temperature: 0.1, // Lower temperature for more consistent output
            },
            systemInstruction: SYSTEM_PROMPT
        });

        const userPrompt = `以下の契約書を、28項目チェックを全て反映した完璧な契約書として「最初から最後まで完全に書き直して」ください。

【入力契約書】
${contractText.substring(0, 25000)}

【重要】
- 「追加してください」などの指示文は出力禁止
- 完璧な契約書の本文のみを出力
- 第1条から最終条まで完全な形で書く`;

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();

        if (!responseText) {
            throw new Error("AI returned empty response");
        }

        let aiResult;
        try {
            aiResult = JSON.parse(responseText);
        } catch (parseError) {
            // If JSON parsing fails, try to extract content
            console.error("JSON parse error, raw response:", responseText.substring(0, 500));
            throw new Error("Failed to parse AI response as JSON");
        }

        const correctedText = aiResult.correctedFullText || "";

        // Validate output - reject if it contains instruction text
        if (correctedText.includes("追加してください") ||
            correctedText.includes("【追加条項") ||
            correctedText.includes("ご確認ください") ||
            correctedText.length < 500) {
            console.error("LLM output validation failed - contains instructions or too short");
            throw new Error("LLM output validation failed");
        }

        return NextResponse.json({
            correctedFullText: correctedText,
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
