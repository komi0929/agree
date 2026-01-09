// @ts-nocheck
import PDFParser from "pdf2json";

/**
 * PDF Text Extraction Service
 * 
 * Uses pdf2json which is a pure JS implementation and highly compatible with Vercel/Next.js serverless environments.
 * This avoids dependency on native modules like canvas or pdfjs-dist legacy builds which cause unstable server errors.
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    console.log(`[PDF] Starting extraction (pdf2json), buffer size: ${buffer.length} bytes`);

    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);

        // 30s timeout to prevent server hanging
        const timeout = setTimeout(() => {
            reject(new Error("PDF解析がタイムアウトしました (30秒経過)"));
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

                // Strategy 1: Raw Text Content (Basic)
                const rawText = pdfParser.getRawTextContent() || "";

                // Strategy 2: Manual Page Reconstruction (Better for Japanese/Complex layouts)
                if (pdfData && pdfData.Pages) {
                    const parts: string[] = [];
                    for (const page of pdfData.Pages) {
                        if (page.Texts) {
                            for (const textObj of page.Texts) {
                                if (textObj.R) {
                                    for (const run of textObj.R) {
                                        if (run.T) {
                                            try {
                                                // pdf2json returns URL-encoded text
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

                    // Choose the method that yielded more content
                    // (Manual extraction is often better for Japanese as rawText might miss spacing or ordering)
                    text = manualText.length > rawText.length ? manualText : rawText;
                } else {
                    text = rawText;
                }

                // Clean up pdf2json specific page break artifacts
                text = text.replace(/[-]+Page \(\d+\) Break[-]+/g, '\n\n');

                // Fix Japanese spacing issue: remove spaces between non-ASCII characters
                // PDF extraction often adds spaces between Japanese characters based on positioning
                text = text.replace(/([^\x01-\x7E])\s+([^\x01-\x7E])/g, '$1$2');

                // Final validation
                if (text.trim().length > 0) {
                    console.log(`[pdf2json] Extraction success. Length: ${text.length}`);
                    resolve(text);
                } else {
                    console.warn(`[pdf2json] Extracted empty text.`);
                    reject(new Error(
                        "PDFからテキストを読み取れませんでした。" +
                        "画像（スキャンデータ）のPDFか、テキストが含まれていない可能性があります。"
                    ));
                }
            } catch (e) {
                console.error("[pdf2json] Processing exception:", e);
                reject(e);
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            clearTimeout(timeout);
            console.error("[pdf2json] Buffer parsing error:", e);
            reject(e);
        }
    });
}
