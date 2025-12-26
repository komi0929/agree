// @ts-nocheck
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extracts text from a PDF buffer using pdfjs-dist.
 * This is a server-side function.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // Convert Buffer to Uint8Array for pdfjs-dist
        const data = new Uint8Array(buffer);

        // Load the PDF document
        const loadingTask = getDocument({
            data,
            useSystemFonts: true, // Reduce reliance on canvas/font loading
            disableFontFace: true, // Disable font face loading to avoid some environment issues
        });

        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        let fullText = "";

        // Iterate over all pages and extract text
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();

            // Join items with space, preserving some structure
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            fullText += pageText + "\n";
        }

        return fullText;

    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        throw new Error(`Failed to extract text from PDF: ${error.message || "Unknown error"}`);
    }
}
