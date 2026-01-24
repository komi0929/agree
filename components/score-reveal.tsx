"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertOctagon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RiskCard {
    title: string;
    description: string;
    level: "critical" | "high" | "medium";
}

interface ScoreRevealProps {
    score: number;
    grade: "A" | "B" | "C" | "D" | "F";
    risks: RiskCard[];
    onContinue: () => void;
}

export function ScoreReveal({
    score,
    grade,
    risks,
    onContinue,
}: ScoreRevealProps) {
    const [displayScore, setDisplayScore] = useState(100);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showRisks, setShowRisks] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);

    // Auto-advance to result (Treating scoring as loading/processing)
    useEffect(() => {
        if (isRevealed) {
            const timer = setTimeout(() => {
                onContinue();
            }, 3500); // Wait 3.5s after score reveal to show the "fixing" effect
            return () => clearTimeout(timer);
        }
    }, [isRevealed, onContinue]);

    // Drum roll animation - count DOWN from 100 to final score
    useEffect(() => {
        let frame = 0;
        const totalFrames = 60;
        const duration = 2000; // Speed up slightly (2.0s)
        const frameInterval = duration / totalFrames;

        // Start from 100 and go down to actual score
        const startValue = 100;
        const endValue = score;

        setIsAnimating(true);

        const timer = setInterval(() => {
            frame++;

            if (frame >= totalFrames) {
                setDisplayScore(endValue);
                setIsRevealed(true);
                setIsAnimating(false);
                clearInterval(timer);
                // Show risks after score reveal
                setTimeout(() => setShowRisks(true), 500);
            } else {
                // Easing function for dramatic effect
                const progress = frame / totalFrames;
                const easeOut = 1 - Math.pow(1 - progress, 3);

                // Add random fluctuation during animation
                const fluctuation = isAnimating ? Math.random() * 8 - 4 : 0;
                const currentValue = startValue - (startValue - endValue) * easeOut + fluctuation;

                setDisplayScore(Math.max(0, Math.min(100, Math.round(currentValue))));
            }
        }, frameInterval);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = () => {
        const s = isRevealed ? score : displayScore;
        if (s >= 80) return "text-green-500";
        if (s >= 60) return "text-yellow-500";
        if (s >= 40) return "text-orange-500";
        return "text-red-500";
    };

    const getBackgroundColor = () => {
        const s = isRevealed ? score : displayScore;
        if (s >= 80) return "from-green-500/10 to-green-500/5";
        if (s >= 60) return "from-yellow-500/10 to-yellow-500/5";
        if (s >= 40) return "from-orange-500/10 to-orange-500/5";
        return "from-red-500/10 to-red-500/5";
    };

    const getGradeLabel = () => {
        switch (grade) {
            case "A": return "安全";
            case "B": return "良好";
            case "C": return "要注意";
            case "D": return "危険";
            case "F": return "非常に危険";
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case "critical":
                return <AlertOctagon className="w-5 h-5 text-red-500" />;
            case "high":
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getRiskBorder = (level: string) => {
        switch (level) {
            case "critical":
                return "border-red-500 bg-red-50";
            case "high":
                return "border-orange-500 bg-orange-50";
            default:
                return "border-yellow-500 bg-yellow-50";
        }
    };

    // For testing: allow continue without login
    const handleButtonClick = () => {
        // For now, always allow continue for testing
        onContinue();
    };

    return (
        <div className={cn(
            "min-h-screen flex flex-col items-center justify-center px-4 py-12",
            "bg-gradient-to-b transition-all duration-500",
            getBackgroundColor()
        )}>
            {/* Score Counter */}
            <div className="text-center mb-12">
                <p className="text-muted-foreground text-sm mb-4 uppercase tracking-wider font-medium">
                    契約書スコア
                </p>
                <div className={cn(
                    "relative inline-flex items-center justify-center",
                    isRevealed && score < 50 && "animate-danger-pulse"
                )}>
                    <div className={cn(
                        "text-8xl font-bold tabular-nums transition-colors duration-300",
                        isAnimating && "animate-pulse",
                        getScoreColor()
                    )}>
                        {displayScore}
                    </div>
                    <span className={cn(
                        "text-4xl font-bold ml-1 mt-8 transition-colors duration-300",
                        getScoreColor()
                    )}>
                        点
                    </span>
                </div>
                {isRevealed && (
                    <div className={cn(
                        "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full animate-bounce-in",
                        score < 50 ? "bg-red-100 text-red-700" :
                            score < 70 ? "bg-orange-100 text-orange-700" :
                                score < 85 ? "bg-yellow-100 text-yellow-700" :
                                    "bg-green-100 text-green-700"
                    )}>
                        <Shield className="w-4 h-4" />
                        <span className="font-bold">{getGradeLabel()}</span>
                    </div>
                )}
            </div>

            {/* 3 Risk Cards */}
            {showRisks && risks.length > 0 && (
                <div className="w-full max-w-2xl space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <h3 className="text-center text-muted-foreground text-sm mb-6">
                        主なリスク
                    </h3>
                    {risks.slice(0, 3).map((risk, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-4 rounded-xl border-l-4 shadow-md transition-all",
                                "animate-in fade-in slide-in-from-left duration-300",
                                getRiskBorder(risk.level)
                            )}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="flex items-start gap-3">
                                {getRiskIcon(risk.level)}
                                <div>
                                    <h4 className="font-bold text-foreground">
                                        {risk.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {risk.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Call to Action */}
            {showRisks && (
                <div className="w-full max-w-md space-y-4 animate-in fade-in duration-500" style={{ animationDelay: "600ms" }}>
                    <Button
                        onClick={handleButtonClick}
                        className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all btn-guardian-pulse"
                    >
                        <Shield className="w-5 h-5 mr-2" />
                        AI修正版（100点）を見る
                    </Button>
                </div>
            )}
        </div>
    );
}

