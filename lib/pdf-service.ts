// @ts-nocheck
// Polyfill DOMMatrix for server-side PDF parsing
if (typeof window === 'undefined' && typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        m11 = 1; m12 = 0; m21 = 0; m22 = 1; m31 = 0; m32 = 0;
        m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    };
}

const pdf = require("pdf-parse");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from PDF");
    }
}
