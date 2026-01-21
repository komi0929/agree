/**
 * Text formatting utilities for contract documents
 * Handles auto-formatting for readable display
 */

/**
 * Format contract text for readable display
 * - Adds proper line breaks after article numbers (第X条)
 * - Indents sub-clauses
 * - Normalizes whitespace
 */
export function formatContractText(rawText: string): string {
    let formatted = rawText;

    // Normalize line breaks
    formatted = formatted.replace(/\r\n/g, "\n");
    formatted = formatted.replace(/\r/g, "\n");

    // Remove excessive blank lines (more than 2 consecutive)
    formatted = formatted.replace(/\n{3,}/g, "\n\n");

    // Add line break after article headers (第X条, 第X項, etc.)
    formatted = formatted.replace(/(第[0-9０-９一二三四五六七八九十百]+条[^\n]*)/g, "\n$1\n");

    // Add line break after numbered items (1., 2., etc. or ①②③)
    formatted = formatted.replace(/([0-9０-９]+\.[^\n]{0,80})/g, "\n  $1");
    formatted = formatted.replace(/([①②③④⑤⑥⑦⑧⑨⑩][^\n]{0,80})/g, "\n  $1");

    // Add line break after parenthetical items ((1), (2), etc.)
    formatted = formatted.replace(/([(（][0-9０-９一二三四五六七八九十]+[)）][^\n]{0,80})/g, "\n    $1");

    // Clean up leading/trailing whitespace
    formatted = formatted.trim();

    // Ensure proper spacing around section headers
    formatted = formatted.replace(/\n(第[0-9０-９一二三四五六七八九十百]+条)/g, "\n\n$1");

    return formatted;
}

/**
 * Calculate deterministic score from risk analysis
 */
export function calculateScore(risks: Array<{ risk_level: string }>): {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    breakdown: { critical: number; high: number; medium: number; low: number };
} {
    const breakdown = {
        critical: risks.filter(r => r.risk_level === "critical").length,
        high: risks.filter(r => r.risk_level === "high").length,
        medium: risks.filter(r => r.risk_level === "medium").length,
        low: risks.filter(r => r.risk_level === "low").length,
    };

    // Scoring: Start at 100, deduct points based on severity
    let score = 100;
    score -= breakdown.critical * 20;  // Critical: -20 each
    score -= breakdown.high * 10;      // High: -10 each
    score -= breakdown.medium * 5;     // Medium: -5 each
    score -= breakdown.low * 2;        // Low: -2 each

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else if (score >= 40) grade = "D";
    else grade = "F";

    return { score, grade, breakdown };
}

/**
 * Generate a unique ID for diff items
 */
export function generateDiffId(): string {
    return `diff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
