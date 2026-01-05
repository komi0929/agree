// @ts-nocheck
import PDFParser from "pdf2json";

/**
 * Extracts text from a PDF buffer using pdf2json.
 * This is a server-side function.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 for text content

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parser Error:", errData.parserError);
            reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // Method 1: Get raw text content
                let text = pdfParser.getRawTextContent() || "";

                // Method 2: If raw text is too short or empty, try manual extraction from pages
                // This is often more reliable for Japanese characters which are URL encoded in pdf2json
                if (text.trim().length < 50 && pdfData.Pages) {
                    let extractedParts = [];
                    for (const page of pdfData.Pages) {
                        for (const textObj of page.Texts) {
                            if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                                // T is usually URL encoded
                                const part = decodeURIComponent(textObj.R[0].T);
                                extractedParts.push(part);
                            }
                        }
                    }
                    if (extractedParts.length > 0) {
                        text = extractedParts.join(" ");
                    }
                }

                resolve(text);
            } catch (e) {
                console.error("Error in dataReady handler:", e);
                // Fallback to whatever raw text we might have
                resolve(pdfParser.getRawTextContent() || "");
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}
