// @ts-nocheck
import PDFParser from "pdf2json";
import pdfParse from "pdf-parse";

/**
 * PDF Text Extraction Service
 * 
 * Uses multiple extraction methods with fallback strategy:
 * 1. pdf-parse (reliable, high quality extraction)
 * 2. pdf2json (backup)
 * 
 * Note: These libraries are configured in next.config.ts as serverComponentsExternalPackages
 * to avoid bundling issues with Webpack/Turbopack.
 */

/**
 * Extract text using pdf-parse library
 * This is generally more robust for various PDF formats including those with complex layouts.
 */
async function extractWithPdfParse(buffer: Buffer): Promise<string> {
    try {
        console.log("[pdf-parse] Starting extraction...");

        // We need to handle the buffer carefully. pdf-parse expects a buffer.
        const data = await pdfParse(buffer);

        const text = data.text || "";
        console.log(`[pdf-parse] Extracted ${text.length} characters from ${data.numpages} pages`);

        // Basic validation of extracted content
        if (text.trim().length === 0) {
            throw new Error("pdf-parse: テキストが空です");
        }

        return text;
    } catch (e: any) {
        console.error("[pdf-parse] Extraction error:", e.message);
        throw e;
    }
}

/**
 * Extract text using pdf2json library
 * Used as a fallback if pdf-parse fails.
 */
async function extractWithPdf2json(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        const timeout = setTimeout(() => {
            reject(new Error("PDF解析がタイムアウトしました (pdf2json)"));
        }, 30000);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            clearTimeout(timeout);
            console.error("[pdf2json] Parser error:", errData.parserError);
            reject(new Error(errData.parserError || "PDF解析エラー"));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            clearTimeout(timeout);
            try {
                let text = "";
                const rawText = pdfParser.getRawTextContent() || "";

                if (pdfData && pdfData.Pages) {
                    const parts: string[] = [];
                    for (const page of pdfData.Pages) {
                        if (page.Texts) {
                            for (const textObj of page.Texts) {
                                if (textObj.R) {
                                    for (const run of textObj.R) {
                                        if (run.T) {
                                            try {
                                                parts.push(decodeURIComponent(run.T));
                                            } catch {
                                                parts.push(run.T);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const manualText = parts.join(" ");
                    // Use longer text
                    text = manualText.length > rawText.length ? manualText : rawText;
                } else {
                    text = rawText;
                }

                // Cleanup
                text = text.replace(/[-]+Page \(\d+\) Break[-]+/g, '\n\n');

                if (text.trim().length > 0) {
                    resolve(text);
                } else {
                    reject(new Error("pdf2json: テキストを抽出できませんでした"));
                }
            } catch (e) {
                console.error("[pdf2json] Processing error:", e);
                reject(e);
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            clearTimeout(timeout);
            console.error("[pdf2json] Parse buffer error:", e);
            reject(e);
        }
    });
}

/**
 * Main extraction function with fallback strategy
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    console.log(`[PDF] Starting extraction, buffer size: ${buffer.length} bytes`);

    const errors: string[] = [];

    // Strategy 1: pdf-parse (Primary)
    try {
        console.log("[PDF] Trying pdf-parse...");
        const text = await extractWithPdfParse(buffer);
        if (text && text.trim().length > 0) {
            console.log("[PDF] pdf-parse succeeded");
            return text;
        }
    } catch (e: any) {
        console.error("[PDF] pdf-parse failed:", e.message);
        errors.push(`pdf-parse: ${e.message}`);
    }

    // Strategy 2: pdf2json (Backup)
    try {
        console.log("[PDF] Trying pdf2json (fallback)...");
        const text = await extractWithPdf2json(buffer);
        if (text && text.trim().length > 0) {
            console.log("[PDF] pdf2json succeeded");
            return text;
        }
    } catch (e: any) {
        console.error("[PDF] pdf2json failed:", e.message);
        errors.push(`pdf2json: ${e.message}`);
    }

    // Failure
    console.error("[PDF] All extraction methods failed:", errors);
    throw new Error(
        "PDFからテキストを抽出できませんでした。" +
        "ファイルが破損しているか、画像ベースのPDF（スキャンデータ）の可能性があります。" +
        "テキスト選択が可能なPDFを使用してください。"
    );
}
