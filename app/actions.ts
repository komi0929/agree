"use server";

import { extractTextFromPdf } from "@/lib/pdf-service";
import { analyzeContractText, extractContractParties, EnhancedAnalysisResult } from "@/lib/ai-service";
import { UserContext } from "@/lib/types/user-context";

// ============================================
// API Key Validation
// ============================================
function validateApiKey(): { valid: boolean; error?: string } {
    if (!process.env.OPENAI_API_KEY) {
        return {
            valid: false,
            error: "システム設定エラー: AI解析サービスが設定されていません。管理者にお問い合わせください。"
        };
    }
    if (process.env.OPENAI_API_KEY.startsWith("sk-") === false) {
        return {
            valid: false,
            error: "システム設定エラー: AI解析サービスの設定が不正です。管理者にお問い合わせください。"
        };
    }
    return { valid: true };
}

// ============================================
// Safe Error Message Extraction
// ============================================
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // OpenAI API errors
        if (error.message.includes("API key")) {
            return "AI解析サービスへの認証に失敗しました。";
        }
        if (error.message.includes("rate limit")) {
            return "サービスが混雑しています。しばらく待ってから再度お試しください。";
        }
        if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
            return "サーバーへの接続がタイムアウトしました。再度お試しください。";
        }
        if (error.message.includes("network") || error.message.includes("ECONNREFUSED")) {
            return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
        }
        // PDF parsing errors
        if (error.message.includes("PDF") || error.message.includes("pdf")) {
            return "PDFファイルの読み込みに失敗しました。ファイルが破損していないか確認してください。";
        }
        // Generic message for other errors
        return error.message;
    }
    return "予期しないエラーが発生しました。";
}

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
    // Pre-check: Validate API key before processing
    const apiKeyCheck = validateApiKey();
    if (!apiKeyCheck.valid) {
        console.error("API Key validation failed:", apiKeyCheck.error);
        return { success: false, message: apiKeyCheck.error };
    }

    try {
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;
        let text = formData.get("text") as string; // Allow passing text directly if already extracted

        // === Server-side validation ===
        const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB (Vercel Request Body Limit)
        const ALLOWED_MIME_TYPES = ["application/pdf"];

        if (!text) {
            if (file && file.size > 0) {
                // File size validation
                if (file.size > MAX_FILE_SIZE) {
                    return { success: false, message: "ファイルサイズが大きすぎます（最大4.5MB）。Vercelの制限により、4.5MBを超えるファイルは現在サポートしていません。必要に応じてPDFを分割してアップロードしてください。" };
                }
                // File type validation
                if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                    return { success: false, message: "PDFファイルのみ対応しています" };
                }

                let arrayBuffer: ArrayBuffer;
                try {
                    arrayBuffer = await file.arrayBuffer();
                } catch (e) {
                    console.error("Failed to read file buffer:", e);
                    return { success: false, message: "ファイルの読み込みに失敗しました。ファイルを再度選択してください。" };
                }

                const buffer = Buffer.from(arrayBuffer);

                try {
                    text = await extractTextFromPdf(buffer);
                    console.log(`[actions] Text extracted successfully: ${text.length} characters`);
                } catch (pdfError: any) {
                    console.error("PDF extraction failed:", pdfError);
                    return {
                        success: false,
                        message: pdfError.message || "PDFからテキストを抽出できませんでした。"
                    };
                }
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

                let response: Response;
                try {
                    response = await fetch(url, { signal: AbortSignal.timeout(30000) });
                } catch (fetchError) {
                    console.error("URL fetch failed:", fetchError);
                    return { success: false, message: "URLからファイルを取得できませんでした。URLが正しいか確認してください。" };
                }

                if (!response.ok) {
                    return { success: false, message: `URLからファイルを取得できませんでした（HTTP ${response.status}）` };
                }

                // Check content-length if available
                const contentLength = response.headers.get("content-length");
                if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
                    return { success: false, message: "ファイルサイズが大きすぎます（最大4.5MB）" };
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                try {
                    text = await extractTextFromPdf(buffer);
                } catch (pdfError) {
                    console.error("PDF extraction from URL failed:", pdfError);
                    return {
                        success: false,
                        message: "PDFからテキストを抽出できませんでした。"
                    };
                }
            } else {
                return { success: false, message: "ファイルまたはURLを入力してください。" };
            }
        }

        if (!text || text.trim().length === 0) {
            return { success: false, message: "テキストの抽出に失敗しました。PDFが空か、パスワード保護されている、または画像ベースのPDFである可能性があります。" };
        }

        // Filter out system markers to check real content length
        const realContent = text.replace(/[-]+Page \(\d+\) Break[-]+/g, '').trim();

        // Logging for debug
        console.log(`Extracted total length: ${text.length}, Real content length: ${realContent.length}`);

        // Minimum text check (Relaxed to 50 characters of real content)
        if (realContent.length < 50) {
            console.warn("Rejecting PDF due to insufficient real content:", realContent.substring(0, 100));
            return { success: false, message: "PDFから十分なテキスト内容を読み取れませんでした。テキスト形式のPDFであることを確認してください（スキャナーで読み取った画像ベースのPDFには対応しておりません）。" };
        }

        // Fast Pass: Extract Parties
        const result = await extractContractParties(text);

        return { success: true, data: result, text: text };

    } catch (error: unknown) {
        console.error("Extraction Error:", error);
        const message = getErrorMessage(error);
        return {
            success: false,
            message: `解析の準備中にエラーが発生しました: ${message}`
        };
    }
}

export async function analyzeDeepAction(text: string, userContext?: UserContext): Promise<AnalysisState> {
    // Pre-check: Validate API key
    const apiKeyCheck = validateApiKey();
    if (!apiKeyCheck.valid) {
        console.error("API Key validation failed:", apiKeyCheck.error);
        return { success: false, message: apiKeyCheck.error };
    }

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
        // [精度向上ログ: 2026-01-09] deterministicScore追加で100%再現性を実現
        // [Phase 1改善: 2026-01-09] source属性を維持してUIで「確実」「AI分析」バッジ表示を可能に
        const result: EnhancedAnalysisResult = {
            summary: mergedResult.summary,
            risks: mergedResult.risks.map(r => ({
                source: r.source, // 検出ソースを維持（rule: 確実, llm: AI分析, both: 確認済み）
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
            deterministicScore: mergedResult.deterministicScore,
        };

        return { success: true, data: result };
    } catch (error: unknown) {
        console.error("Deep Analysis Error:", error);
        const message = getErrorMessage(error);
        return { success: false, message: `詳細解析中にエラーが発生しました: ${message}` };
    }
}

export async function analyzeContract(prevState: any, formData: FormData): Promise<AnalysisState> {
    // Pre-check: Validate API key
    const apiKeyCheck = validateApiKey();
    if (!apiKeyCheck.valid) {
        console.error("API Key validation failed:", apiKeyCheck.error);
        return { success: false, message: apiKeyCheck.error };
    }

    try {
        const file = formData.get("file") as File;
        const url = formData.get("url") as string;

        let text = "";

        if (file && file.size > 0) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                text = await extractTextFromPdf(buffer);
            } catch (pdfError) {
                console.error("PDF extraction failed:", pdfError);
                return { success: false, message: "PDFからテキストを抽出できませんでした。" };
            }
        } else if (url) {
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
                if (!response.ok) {
                    return { success: false, message: `URLからファイルを取得できませんでした（HTTP ${response.status}）` };
                }
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                text = await extractTextFromPdf(buffer);
            } catch (fetchError) {
                console.error("URL fetch or PDF extraction failed:", fetchError);
                return { success: false, message: "URLからのPDF取得または解析に失敗しました。" };
            }
        } else {
            return { success: false, message: "ファイルまたはURLを入力してください。" };
        }

        if (!text || text.trim().length === 0) {
            return { success: false, message: "テキストの抽出に失敗しました。PDFの内容を確認してください。" };
        }

        const result = await analyzeContractText(text);

        return { success: true, data: result };

    } catch (error: unknown) {
        console.error("Analysis Error:", error);
        const message = getErrorMessage(error);
        return { success: false, message: `解析中にエラーが発生しました: ${message}` };
    }
}

