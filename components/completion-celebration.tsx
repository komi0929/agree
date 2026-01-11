"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, PartyPopper } from "lucide-react";

interface CompletionCelebrationProps {
    show: boolean;
    onComplete?: () => void;
}

const CONFETTI_COLORS = [
    "#009E60", // Green
    "#CDE8E5", // Light Blue
    "#EEF7FF", // Alice Blue
    "#FFD700", // Gold
    "#7AB2D3", // Blue
    "#4A4A4A", // Dark Gray
];

export function CompletionCelebration({ show, onComplete }: CompletionCelebrationProps) {
    const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: string; color: string; delay: string }>>([]);
    const [showCheckmark, setShowCheckmark] = useState(false);

    useEffect(() => {
        if (show) {
            // Generate confetti pieces
            const pieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: `${Math.random() * 0.5}s`,
            }));
            setConfettiPieces(pieces);

            // Show checkmark after a short delay
            setTimeout(() => setShowCheckmark(true), 200);

            // Trigger onComplete after animation
            if (onComplete) {
                setTimeout(onComplete, 3000);
            }
        } else {
            setConfettiPieces([]);
            setShowCheckmark(false);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {/* Confetti */}
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece rounded-sm"
                    style={{
                        left: piece.left,
                        backgroundColor: piece.color,
                        animationDelay: piece.delay,
                    }}
                />
            ))}

            {/* Center Celebration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl animate-bounce-in border border-primary/20">
                    <div className="flex flex-col items-center gap-4">
                        {/* Animated Checkmark */}
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full bg-primary flex items-center justify-center ${showCheckmark ? "animate-circle-fill" : "opacity-0"}`}>
                                <Check className={`w-10 h-10 text-white ${showCheckmark ? "animate-check-draw" : "opacity-0"}`} strokeWidth={3} />
                            </div>
                            {/* Sparkles around */}
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#FFD700] animate-sparkle" style={{ animationDelay: "0.2s" }} />
                            <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-primary/60 animate-sparkle" style={{ animationDelay: "0.5s" }} />
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-primary flex items-center gap-2 justify-center">
                                <PartyPopper className="w-5 h-5 text-[#FFD700] animate-gentle-rotate" />
                                お疲れさまでした！
                                <PartyPopper className="w-5 h-5 text-primary animate-gentle-rotate" style={{ animationDelay: "0.5s" }} />
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                確認が完了しました
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Learning Summary Component - Shows what was learned from this check
 */
interface LearningSummaryProps {
    risks: Array<{ section_title: string; clause_tag: string }>;
    className?: string;
}

export function LearningSummary({ risks, className = "" }: LearningSummaryProps) {
    // Group by clause_tag to generate learning points
    const learningPoints = generateLearningPoints(risks);

    if (learningPoints.length === 0) return null;

    return (
        <div className={`bg-primary/5 rounded-2xl p-5 border border-primary/20 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-primary">今回学べたこと</h4>
            </div>
            <ul className="space-y-2">
                {learningPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary font-medium shrink-0">{["①", "②", "③", "④", "⑤"][i] || `${i + 1}.`}</span>
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function generateLearningPoints(risks: Array<{ section_title: string; clause_tag: string }>): string[] {
    const clauseToLearning: Record<string, string> = {
        "CLAUSE_PAYMENT": "支払条件は必ず確認しましょう（60日ルールなど）",
        "CLAUSE_IP": "著作権の帰属条項は慎重に確認",
        "CLAUSE_LIABILITY": "損害賠償の上限設定は重要です",
        "CLAUSE_TERMINATION": "契約解除時の扱いを明確に",
        "CLAUSE_NON_COMPETE": "競業避止義務は期間と範囲を確認",
        "CLAUSE_CONFIDENTIAL": "秘密保持の範囲と期間を確認",
        "CLAUSE_SCOPE": "業務範囲は具体的に定義されているか確認",
        "CLAUSE_ACCEPTANCE": "検収条件と基準を明確に",
        "CLAUSE_HARASSMENT": "ハラスメント対策条項の有無を確認",
    };

    const usedTags = new Set<string>();
    const points: string[] = [];

    for (const risk of risks) {
        if (!usedTags.has(risk.clause_tag) && clauseToLearning[risk.clause_tag]) {
            usedTags.add(risk.clause_tag);
            points.push(clauseToLearning[risk.clause_tag]);
        }
        if (points.length >= 3) break; // Max 3 points
    }

    return points;
}
