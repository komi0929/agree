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
                // pdf2json returns raw text content in a specific format
                // We need to parse it if we want clean text, but getRawTextContent() matches the structure
                const text = pdfParser.getRawTextContent();
                resolve(text);
            } catch (e) {
                reject(e);
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}
