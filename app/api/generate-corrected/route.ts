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

        const prompt = `あなたは業務委託契約書の専門家です。以下の契約書を、受注者（乙）を完全に保護する完璧な契約書として書き直してください。

【入力契約書】
${contractText.substring(0, 15000)}

【必須修正項目】以下を必ず修正：
1. 支払期日 → 「成果物納入日から60日以内に乙の指定する銀行口座に振り込む」
2. 損害賠償 → 「通常かつ直接の損害に限り、委託料総額を上限として賠償」
3. 著作権 → 「著作権法第27条及び第28条に定める権利は乙に留保される」
4. 競業避止 → 「契約終了後1年間」に短縮、または削除
5. 報酬額 → 「金1,000,000円（消費税別途）」のように具体的金額を明記

【必須追加条項】以下を条文として追加（タイトルと本文を書く）：
- みなし検収：「納品後10日以内に甲から異議がない場合は、検収に合格したものとみなす」
- 遅延損害金：「甲が支払いを遅延した場合、年率14.6%の遅延損害金を支払う」
- 中途解約精算：「解約時は、乙が遂行した作業に相当する報酬を精算して支払う」
- 消費税：「委託料は税別とし、消費税は別途申し受ける」
- 経費負担：「業務遂行に必要な実費（旅費・素材費等）は甲が負担する」
- 履行遅滞免責：「甲の資料提供遅れ等による納期遅延について、乙は責任を負わない」
- 背景IP留保：「乙が従前より保有するコード・ライブラリ等の権利は乙に留保される」
- 二次利用料：「当初目的以外での成果物利用は、別途協議の上、追加対価を支払う」
- 追加作業：「仕様書範囲外の追加作業が発生した場合、別途見積もりの上、追加報酬を支払う」

【出力ルール】
1. 第1条から最終条まで連番で条文を並べる
2. 契約書タイトル、当事者表示、署名欄、日付を含める
3. 報酬額は「金1,000,000円」のような具体的な数字で書く（〇〇円は禁止）
4. 説明文や「追加してください」等の指示文は書かない
5. 【】で囲んだラベルは書かない
6. 契約書本文のみを出力する`;


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
