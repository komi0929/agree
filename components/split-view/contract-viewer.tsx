"use client";

import { useEffect, useRef } from "react";
import { EnhancedAnalysisResult } from "@/lib/ai-service";

interface ContractViewerProps {
    text: string;
    risks: EnhancedAnalysisResult["risks"];
    highlightedRiskIndex: number | null;
}

export function ContractViewer({ text, risks, highlightedRiskIndex }: ContractViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to highlight text
    // This is a simplified implementation. Real-world contract text matching is hard.
    // We will attempt to find exact matches of `original_text` and wrap them in marks.
    // For large texts, we might just display the raw text and highlight if easy, 
    // or rely on the user to find context. 
    // Given the prompt "Split screen... clicking suggestion highlights relevant text", we must try.

    // Split text by newlines for basic formatting
    const paragraphs = text.split("\n").filter(p => p.trim() !== "");

    // Create a map of which paragraph contains which risk
    const riskMap = new Map<number, number[]>(); // paragraphIndex -> riskIndices[]

    paragraphs.forEach((para, pIndex) => {
        risks.forEach((risk, rIndex) => {
            if (para.includes(risk.original_text) || risk.original_text.includes(para)) {
                // Fuzzy match or exact match
                const existing = riskMap.get(pIndex) || [];
                riskMap.set(pIndex, [...existing, rIndex]);
            }
        });
    });

    useEffect(() => {
        if (highlightedRiskIndex !== null) {
            const element = document.getElementById(`risk-target-${highlightedRiskIndex}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [highlightedRiskIndex]);

    return (
        <div className="p-8 md:p-12 font-serif text-slate-800 leading-loose text-lg bg-white min-h-full shadow-inner">
            {paragraphs.map((para, i) => {
                const riskIndices = riskMap.get(i);
                if (riskIndices && riskIndices.length > 0) {
                    // This paragraph contains a risk
                    const isHighlighted = highlightedRiskIndex !== null && riskIndices.includes(highlightedRiskIndex);

                    // Determine color based on highest risk level in this paragraph?
                    // Or just generic highlight.
                    // The prompt asks for Red/Yellow/Green categories on ONLY the Right screen.
                    // But clicking highlight on left.

                    return (
                        <p
                            key={i}
                            id={`risk-target-${riskIndices[0]}`} // Just use the first one for ID anchor
                            className={`mb-6 p-2 rounded transition-colors duration-500
                                ${isHighlighted ? "bg-yellow-100 ring-2 ring-yellow-400" : "bg-red-50/50 hover:bg-red-50"}
                            `}
                        >
                            {para}
                        </p>
                    );
                }
                return (
                    <p key={i} className="mb-6 opacity-80 hover:opacity-100 transition-opacity">
                        {para}
                    </p>
                );
            })}
        </div>
    );
}
