"use server";

import { extractTextFromPdf } from "@/lib/pdf-service";
import { analyzeContractText, extractContractParties, EnhancedAnalysisResult } from "@/lib/ai-service";
import { UserContext } from "@/lib/types/user-context";

export type AnalysisState = {
    success: boolean;
    message?: string;
    data?: Awaited<ReturnType<typeof analyzeContractText>>;
};

export type ExtractionState = {
    success: boolean;
    message?: string;
    data?: Awaited<ReturnType<typeof extractContractParties>>;
    text?: string; // Return the extracted text so client doesn't need to re-upload
};

export async function extractPartiesAction(prevState: any, formData: FormData): Promise<ExtractionState> {
    try {
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;
        let text = formData.get("text") as string; // Allow passing text directly if already extracted

        // === Server-side validation ===
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_MIME_TYPES = ["application/pdf"];

        if (!text) {
            if (file && file.size > 0) {
                // File size validation
                if (file.size > MAX_FILE_SIZE) {
                    return { success: false, message: "ファイルサイズが大きすぎます（最大10MB）" };
                }
                // File type validation
                if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                    return { success: false, message: "PDFファイルのみ対応しています" };
                }

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                text = await extractTextFromPdf(buffer);
            } else if (url) {
                // URL validation: must be https and end with .pdf
                try {
                    const parsedUrl = new URL(url);
                    if (parsedUrl.protocol !== "https:") {
                        return { success: false, message: "セキュリティのため、HTTPS URLのみ対応しています" };
                    }
                    if (!parsedUrl.pathname.toLowerCase().endsWith(".pdf")) {
                        return { success: false, message: "PDFファイルのURLを指定してください" };
                    }
                } catch {
                    return { success: false, message: "URLの形式が正しくありません" };
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to fetch PDF from URL");
                }

                // Check content-length if available
                const contentLength = response.headers.get("content-length");
                if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
                    return { success: false, message: "ファイルサイズが大きすぎます（最大10MB）" };
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                text = await extractTextFromPdf(buffer);
            } else {
                return { success: false, message: "ファイルまたはURLを入力してください。" };
            }
        }

        if (!text || text.trim().length === 0) {
            return { success: false, message: "テキストの抽出に失敗しました。" };
        }

        // Fast Pass: Extract Parties
        const result = await extractContractParties(text);

        return { success: true, data: result, text: text };

    } catch (error) {
        console.error("Extraction Error:", error);
        return { success: false, message: "解析の準備中にエラーが発生しました。" };
    }
}

export async function analyzeDeepAction(text: string, userContext?: UserContext): Promise<AnalysisState> {
    try {
        if (!text) return { success: false, message: "テキストがありません" };

        // [精度向上ログ: 2024-12-25]
        // Layer 1: ルールベースチェック（並列実行）
        // Layer 3: LLM解析（並列実行）
        // Layer 4: 結果統合

        const { runRuleBasedChecks } = await import("@/lib/rules/rule-checker");
        const { mergeAnalysisResults } = await import("@/lib/legal/result-merger");

        // 並列実行
        const [ruleResult, llmResult] = await Promise.all([
            Promise.resolve(runRuleBasedChecks(text)),
            analyzeContractText(text, userContext),
        ]);

        // 結果を統合
        const mergedResult = mergeAnalysisResults(ruleResult, llmResult);

        // EnhancedAnalysisResult形式に変換して返す
        const result: EnhancedAnalysisResult = {
            summary: mergedResult.summary,
            risks: mergedResult.risks.map(r => ({
                clause_tag: r.clause_tag,
                section_title: r.section_title,
                original_text: r.original_text || "",
                risk_level: r.risk_level,
                violated_laws: r.violated_laws,
                explanation: r.explanation,
                suggestion: r.suggestion,
            })),
            contract_classification: mergedResult.contract_classification,
            missing_clauses: mergedResult.missing_clauses,
        };

        return { success: true, data: result };
    } catch (error) {
        console.error("Deep Analysis Error:", error);
        return { success: false, message: "詳細解析中にエラーが発生しました。" };
    }
}

export async function analyzeContract(prevState: any, formData: FormData): Promise<AnalysisState> {
    try {
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;

        let text = "";

        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            text = await extractTextFromPdf(buffer);
        } else if (url) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch PDF from URL");
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            text = await extractTextFromPdf(buffer);
        } else {
            return { success: false, message: "ファイルまたはURLを入力してください。" };
        }

        if (!text || text.trim().length === 0) {
            return { success: false, message: "テキストの抽出に失敗しました。PDFの内容を確認してください。" };
        }

        const result = await analyzeContractText(text);

        return { success: true, data: result };

    } catch (error) {
        console.error("Analysis Error:", error);
        return { success: false, message: "解析中にエラーが発生しました。" };
    }
}
