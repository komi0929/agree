// lib/contract-generator.ts
// 契約書生成サービス
//
// [精度向上ログ: 2024-12-25]
// 意図: ユーザー入力から最強の契約書を生成
// [Update: 2026-01-21] Gemini 3 Flashへ移行

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContractInput } from "@/lib/types/contract-input";
import { buildContractGenerationPrompt, buildEmailPrompt } from "@/lib/prompts/contract-generation";

function getGeminiModel() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY is not set.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-3.0-flash",
    });
}

export interface GeneratedContract {
    markdown: string;
    highlightedClauses: string[];
}

export interface GeneratedEmail {
    subject: string;
    body: string;
}

/**
 * 契約書を生成
 */
export async function generateContract(input: ContractInput): Promise<GeneratedContract> {
    try {
        const systemPrompt = buildContractGenerationPrompt(input);
        const model = getGeminiModel();

        // Gemini supports systemInstruction, but for simple prompts we can just concatenate or pass as config
        // Re-initializing with system prompt for better adherence
        const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
        const genAI = new GoogleGenerativeAI(apiKey);
        const generationModel = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: systemPrompt
        });

        const result = await generationModel.generateContent("上記の情報をもとに、業務委託契約書を生成してください。");
        const markdown = result.response.text();

        if (!markdown || markdown.trim().length < 100) {
            throw new Error("生成された契約書が空または不完全です");
        }

        // ⭐マークの付いた条項を抽出
        const highlightedClauses: string[] = [];
        const lines = markdown.split("\n");
        for (const line of lines) {
            if (line.includes("⭐")) {
                // 条文タイトルから⭐以前の部分を抽出
                const match = line.match(/第\d+条（([^）]+)）/);
                if (match) {
                    highlightedClauses.push(match[1]);
                }
            }
        }

        return {
            markdown,
            highlightedClauses,
        };
    } catch (error: any) {
        console.error("Contract generation error:", error);
        // 開発中は詳細なエラーを表示
        const errorDetail = error?.message || JSON.stringify(error) || "Unknown error";
        throw new Error(`生成エラー: ${errorDetail}`);
    }
}

/**
 * 契約書をもとに修正を行う
 */
export async function modifyContract(
    currentContract: string,
    instruction: string,
    input: ContractInput
): Promise<string> {
    const systemPrompt = `あなたはフリーランス有利の契約書エキスパートです。
ユーザーの指示に従って契約書を修正してください。
ただし、ユーザーに不利になる変更は避けてください。

修正後の契約書全文をMarkdown形式で出力してください。`;

    const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3.0-flash",
        systemInstruction: systemPrompt
    });

    const userContent = `現在の契約書:
\`\`\`
${currentContract}
\`\`\`

修正指示: ${instruction}

契約の基本情報:
- 甲（発注者）: ${input.clientName}
- 乙（受注者）: ${input.userName}
- 報酬: ${input.amount.toLocaleString()}円（税別）`;

    const result = await model.generateContent(userContent);
    return result.response.text() || currentContract;
}

/**
 * 送付用メールを生成
 */
export async function generateEmail(
    input: ContractInput,
    contractMarkdown: string
): Promise<GeneratedEmail> {
    const prompt = buildEmailPrompt(input, contractMarkdown);

    // For email, we can use a simpler instruction
    const apiKey = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-3.0-flash",
        systemInstruction: "ビジネスメールを作成するエキスパートです。丁寧かつ簡潔なメールを作成します。"
    });

    const result = await model.generateContent(prompt);
    const body = result.response.text() || "";

    return {
        subject: "【ご確認】業務委託契約書のお送り",
        body,
    };
}
