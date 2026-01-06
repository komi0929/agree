"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, PartyPopper } from "lucide-react";

interface CompletionCelebrationProps {
    show: boolean;
    onComplete?: () => void;
}

const CONFETTI_COLORS = [
    "#6366f1", // indigo
    "#a855f7", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#3b82f6", // blue
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
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl animate-bounce-in">
                    <div className="flex flex-col items-center gap-4">
                        {/* Animated Checkmark */}
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center ${showCheckmark ? "animate-circle-fill" : "opacity-0"}`}>
                                <Check className={`w-10 h-10 text-white ${showCheckmark ? "animate-check-draw" : "opacity-0"}`} strokeWidth={3} />
                            </div>
                            {/* Sparkles around */}
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-sparkle" style={{ animationDelay: "0.2s" }} />
                            <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-purple-400 animate-sparkle" style={{ animationDelay: "0.5s" }} />
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-center">
                                <PartyPopper className="w-5 h-5 text-amber-500 animate-gentle-rotate" />
                                お疲れさまでした！
                                <PartyPopper className="w-5 h-5 text-pink-500 animate-gentle-rotate" style={{ animationDelay: "0.5s" }} />
                            </h3>
                            <p className="text-sm text-slate-500">
                                チェックが完了しました
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
        <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📚</span>
                <h4 className="font-semibold text-slate-800">今回学べたこと</h4>
            </div>
            <ul className="space-y-2">
                {learningPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-indigo-500 font-medium shrink-0">{["①", "②", "③", "④", "⑤"][i] || `${i + 1}.`}</span>
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
        "CLAUSE_IP": "著作権の帰属条項は慎重にチェック",
        "CLAUSE_LIABILITY": "損害賠償の上限設定は重要です",
        "CLAUSE_TERMINATION": "契約解除時の扱いを明確に",
        "CLAUSE_NON_COMPETE": "競業避止義務は期間と範囲を確認",
        "CLAUSE_CONFIDENTIAL": "秘密保持の範囲と期間をチェック",
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
