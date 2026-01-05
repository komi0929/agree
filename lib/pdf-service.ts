// @ts-nocheck
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Extracts text from a PDF buffer using pdfjs-dist directly.
 * This is the most reliable method for Japanese text extraction.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(buffer);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
        });

        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;

        console.log(`[PDF] Processing ${numPages} pages...`);

        const textParts: string[] = [];

        // Process each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            try {
                const page = await pdfDocument.getPage(pageNum);
                const textContent = await page.getTextContent();

                // Extract text from items
                let pageText = '';
                let lastY: number | null = null;

                for (const item of textContent.items) {
                    if ('str' in item && item.str) {
                        // Check if we need a line break (based on Y position)
                        if (lastY !== null && Math.abs((item as any).transform[5] - lastY) > 5) {
                            pageText += '\n';
                        }
                        pageText += item.str;
                        lastY = (item as any).transform[5];
                    }
                }

                if (pageText.trim()) {
                    textParts.push(pageText);
                }

                console.log(`[PDF] Page ${pageNum}: ${pageText.length} characters extracted`);
            } catch (pageError) {
                console.error(`[PDF] Error processing page ${pageNum}:`, pageError);
                // Continue with other pages even if one fails
            }
        }

        const fullText = textParts.join('\n\n');

        console.log(`[PDF] Total extracted: ${fullText.length} characters`);

        if (!fullText || fullText.trim().length === 0) {
            throw new Error("PDFからテキストを抽出できませんでした。このPDFはスキャナーで読み取った画像形式か、テキストレイヤーが含まれていない可能性があります。");
        }

        return fullText;

    } catch (error: any) {
        console.error("[PDF] Extraction failed:", error);

        // Provide user-friendly error messages
        if (error.message?.includes("password") || error.message?.includes("Password")) {
            throw new Error("このPDFはパスワードで保護されています。パスワードを解除してからアップロードしてください。");
        }

        if (error.message?.includes("Invalid") || error.message?.includes("corrupt")) {
            throw new Error("PDFファイルが破損しているか、形式が正しくありません。別のPDFをお試しください。");
        }

        // Re-throw with the original message or a default one
        throw new Error(error.message || "PDFの解析中にエラーが発生しました。");
    }
}
