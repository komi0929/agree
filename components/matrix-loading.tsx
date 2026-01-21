"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LOG_MESSAGES = [
    { text: "Loading Document...", emoji: "📄", delay: 100 },
    { text: "Scanning for hidden traps...", emoji: "🧐", delay: 150 },
    { text: "Detecting: \"Unpaid Labor Risk\"", emoji: "😱", delay: 200 },
    { text: "Detecting: \"Unlimited Liability\"", emoji: "💣", delay: 180 },
    { text: "Detecting: \"IP Transfer Clause\"", emoji: "⚠️", delay: 160 },
    { text: "Injecting protective clauses...", emoji: "💉", delay: 220 },
    { text: "Refactoring logic...", emoji: "🧠", delay: 200 },
    { text: "Optimizing for YOUR profit", emoji: "💰", delay: 180 },
    { text: "Converting to Human readable format...", emoji: "🗣️", delay: 250 },
    { text: "DONE.", emoji: "✨", delay: 500 },
];

interface MatrixLoadingProps {
    isActive: boolean;
    onComplete?: () => void;
}

export function MatrixLoading({ isActive, onComplete }: MatrixLoadingProps) {
    const [logs, setLogs] = useState<{ text: string; emoji: string; id: number }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const logIdCounter = useRef(0);

    useEffect(() => {
        if (!isActive) {
            setLogs([]);
            setCurrentIndex(0);
            setIsComplete(false);
            return;
        }

        const addLog = () => {
            if (currentIndex >= LOG_MESSAGES.length) {
                // Loop back and continue
                setCurrentIndex(0);
                return;
            }

            const message = LOG_MESSAGES[currentIndex];
            const newLog = {
                ...message,
                id: logIdCounter.current++,
            };

            setLogs(prev => {
                // Keep only last 20 logs for performance
                const updated = [...prev, newLog];
                if (updated.length > 20) {
                    return updated.slice(-20);
                }
                return updated;
            });

            setCurrentIndex(prev => prev + 1);
        };

        // Add logs rapidly
        const interval = setInterval(addLog, 80);

        return () => clearInterval(interval);
    }, [isActive, currentIndex]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    // Handle completion callback
    useEffect(() => {
        if (currentIndex >= LOG_MESSAGES.length && !isComplete) {
            setIsComplete(true);
            // Continue looping for visual effect until parent says stop
        }
    }, [currentIndex, isComplete, onComplete]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
            {/* Matrix rain background effect */}
            <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-primary font-mono text-xs animate-matrix-fall"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 5}s`,
                        }}
                    >
                        {String.fromCharCode(0x30A0 + Math.random() * 96)}
                    </div>
                ))}
            </div>

            {/* Console container */}
            <div className="relative w-full max-w-2xl mx-4">
                {/* Terminal header */}
                <div className="bg-slate-800 rounded-t-xl px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-slate-400 text-xs font-mono ml-2">
                        agree-contract-analyzer -- analyzing...
                    </span>
                </div>

                {/* Console body */}
                <div
                    ref={containerRef}
                    className="bg-slate-950 rounded-b-xl p-4 h-80 overflow-y-auto font-mono text-sm space-y-1 border border-t-0 border-slate-700"
                >
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
                        >
                            <span className="text-slate-500">&gt;</span>
                            <span className="text-primary">{log.text}</span>
                            <span>{log.emoji}</span>
                        </div>
                    ))}
                    {/* Blinking cursor */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">&gt;</span>
                        <span className="w-2 h-4 bg-primary animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm mb-2">契約書を解析中...</p>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress-indeterminate" />
                </div>
            </div>
        </div>
    );
}
