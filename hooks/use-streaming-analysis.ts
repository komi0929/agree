"use client";

import { useState, useCallback, useRef } from "react";

export type StreamingState = "idle" | "connecting" | "streaming" | "parsing" | "complete" | "error";

export interface StreamingAnalysisResult {
    // Accumulated raw content
    rawContent: string;
    // Parsed result (available when complete)
    parsedResult: any | null;
    // Current state
    state: StreamingState;
    // Progress (0-100, estimated)
    progress: number;
    // Error message if any
    error: string | null;
    // Time elapsed in ms
    elapsedTime: number;
}

export interface UseStreamingAnalysisOptions {
    onProgress?: (content: string, progress: number) => void;
    onComplete?: (result: any) => void;
    onError?: (error: string) => void;
}

export function useStreamingAnalysis(options: UseStreamingAnalysisOptions = {}) {
    const [state, setState] = useState<StreamingState>("idle");
    const [rawContent, setRawContent] = useState("");
    const [parsedResult, setParsedResult] = useState<any | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const abortControllerRef = useRef<AbortController | null>(null);
    const startTimeRef = useRef<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startAnalysis = useCallback(async (text: string, userRole: "vendor" | "client" = "vendor") => {
        // Reset state
        setRawContent("");
        setParsedResult(null);
        setError(null);
        setProgress(0);
        setElapsedTime(0);
        setState("connecting");

        // Start timer
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTime(Date.now() - startTimeRef.current);
        }, 100);

        // Create abort controller
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("/api/analyze-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, userRole }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            setState("streaming");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);

                        if (data === "[DONE]") {
                            continue;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                accumulated += parsed.content;
                                setRawContent(accumulated);

                                // Estimate progress based on content structure
                                const estimatedProgress = estimateProgress(accumulated);
                                setProgress(estimatedProgress);
                                options.onProgress?.(accumulated, estimatedProgress);
                            }
                        } catch {
                            // Skip malformed JSON chunks
                        }
                    }
                }
            }

            // Parse the accumulated JSON
            setState("parsing");
            setProgress(95);

            try {
                const result = JSON.parse(accumulated);
                setParsedResult(result);
                setState("complete");
                setProgress(100);
                options.onComplete?.(result);
            } catch (parseError) {
                throw new Error("Failed to parse AI response");
            }

        } catch (err: any) {
            if (err.name === "AbortError") {
                setState("idle");
            } else {
                const errorMessage = err.message || "Unknown error";
                setError(errorMessage);
                setState("error");
                options.onError?.(errorMessage);
            }
        } finally {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [options]);

    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setState("idle");
    }, []);

    return {
        startAnalysis,
        abort,
        state,
        rawContent,
        parsedResult,
        progress,
        error,
        elapsedTime,
        isLoading: state === "connecting" || state === "streaming" || state === "parsing",
    };
}

// Estimate progress based on JSON structure detection
function estimateProgress(content: string): number {
    // Look for key markers in the streaming JSON
    const markers = [
        { pattern: /"summary"/, weight: 10 },
        { pattern: /"contract_classification"/, weight: 15 },
        { pattern: /"risks"/, weight: 20 },
        { pattern: /"clause_tag"/, weight: 30 },
        { pattern: /"explanation"/, weight: 50 },
        { pattern: /"suggestion"/, weight: 70 },
        { pattern: /"missing_clauses"/, weight: 85 },
        { pattern: /\}$/, weight: 90 },
    ];

    let maxProgress = 5; // Minimum once streaming starts

    for (const marker of markers) {
        if (marker.pattern.test(content)) {
            maxProgress = Math.max(maxProgress, marker.weight);
        }
    }

    // Also factor in content length (rough estimate)
    const lengthProgress = Math.min(content.length / 5000 * 80, 80);

    return Math.max(maxProgress, lengthProgress);
}
