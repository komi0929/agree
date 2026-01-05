import pdf from "pdf-parse";

/**
 * Extracts text from a PDF buffer using pdf-parse with improved options.
 * This is a server-side function.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        // pdf-parse options
        const options = {
            // pagerender is called for each page
            // We can use it to ensure we capture as much text as possible
            pagerender: function (pageData: any) {
                return pageData.getTextContent()
                    .then(function (textContent: any) {
                        let lastY, text = '';
                        for (let item of textContent.items) {
                            if (lastY == item.transform[5] || !lastY) {
                                text += item.str;
                            } else {
                                text += '\n' + item.str;
                            }
                            lastY = item.transform[5];
                        }
                        return text;
                    });
            }
        };

        const data = await pdf(buffer, options);

        let text = data.text || "";

        // Clean up text
        // - Normalize whitespace
        // - Remove null characters which sometimes appear in bad encodings
        // - Keep line breaks as they are important for structure
        text = text.replace(/\0/g, '');

        // If text looks like it's just page markers or empty, trim and check
        const cleanText = text.replace(/[-]+Page \(\d+\) Break[-]+/g, '').trim();

        if (cleanText.length === 0) {
            // If we have some text but it was all markers, or absolutely no text
            // It's likely an image-based PDF
            throw new Error("PDFからテキストを抽出できませんでした。スキャナーで読み取った画像形式のPDFか、パスワード保護されている可能性があります。");
        }

        return text;
    } catch (error: any) {
        console.error("PDF Parsing failed:", error);
        if (error.message.includes("password")) {
            throw new Error("このPDFはパスワードで保護されているため、解析できません。");
        }
        throw error;
    }
}
