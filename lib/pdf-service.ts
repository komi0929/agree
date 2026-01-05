// @ts-nocheck
import PDFParser from "pdf2json";

/**
 * Extracts text from a PDF buffer using pdf2json.
 * This is a server-side function.
 * We're using pdf2json because it's more compatible with Vercel's Turbopack build.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 for text content

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parser Error:", errData.parserError);
            reject(new Error(errData.parserError || "PDFの解析中にエラーが発生しました"));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // Method 1: Get raw text content
                let text = pdfParser.getRawTextContent() || "";

                // Method 2: If raw text is too short or empty, try manual extraction from pages
                // This is often more reliable for Japanese characters which are URL encoded in pdf2json
                if (text.replace(/[-]+Page \(\d+\) Break[-]+/g, '').trim().length < 50 && pdfData.Pages) {
                    const extractedParts: string[] = [];
                    for (const page of pdfData.Pages) {
                        if (page.Texts) {
                            for (const textObj of page.Texts) {
                                if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                                    // T is usually URL encoded
                                    try {
                                        const part = decodeURIComponent(textObj.R[0].T);
                                        extractedParts.push(part);
                                    } catch {
                                        // If decoding fails, use raw text
                                        extractedParts.push(textObj.R[0].T);
                                    }
                                }
                            }
                        }
                    }
                    if (extractedParts.length > 0) {
                        text = extractedParts.join(" ");
                    }
                }

                // Clean up - remove page break markers for final validation
                const cleanText = text.replace(/[-]+Page \(\d+\) Break[-]+/g, '').trim();

                if (cleanText.length === 0) {
                    reject(new Error("PDFからテキストを抽出できませんでした。スキャナーで読み取った画像形式のPDFか、パスワード保護されている可能性があります。"));
                    return;
                }

                resolve(text);
            } catch (e) {
                console.error("Error in dataReady handler:", e);
                // Fallback to whatever raw text we might have
                const fallbackText = pdfParser.getRawTextContent() || "";
                if (fallbackText.trim().length > 0) {
                    resolve(fallbackText);
                } else {
                    reject(new Error("PDFからテキストを抽出できませんでした"));
                }
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}
