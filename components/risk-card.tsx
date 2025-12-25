import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { AnalysisResult } from "@/lib/ai-service";

type Risk = AnalysisResult["risks"][0];

interface RiskCardProps {
    risk: Risk;
}

export function RiskCard({ risk }: RiskCardProps) {
    const riskLevelColor =
        risk.risk_level === "critical" ? "bg-purple-500" :
            risk.risk_level === "high" ? "bg-red-400" :
                risk.risk_level === "medium" ? "bg-amber-400" : "bg-blue-400";

    // Get the neutral message for display
    const negotiationMessage = typeof risk.suggestion.negotiation_message === "string"
        ? risk.suggestion.negotiation_message
        : risk.suggestion.negotiation_message.neutral;

    return (
        <div className="group space-y-4">
            {/* Header: Dot + Title */}
            <div className="flex items-baseline gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${riskLevelColor}`} />
                <h3 className="text-lg font-medium text-slate-900 leading-snug">
                    {risk.section_title}
                </h3>
            </div>

            {/* Content Container */}
            <div className="pl-5 space-y-8 border-l border-slate-100 ml-1 py-1">
                {/* Original Text Quote */}
                <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-normal tracking-wider">原文</p>
                    <div className="text-slate-500 font-serif italic text-sm leading-relaxed opacity-80">
                        &quot;{risk.original_text}&quot;
                    </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-normal tracking-wider">解説</p>
                    <p className="text-slate-800 leading-loose font-light">
                        {risk.explanation}
                    </p>
                </div>

                {/* Revision */}
                <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-normal tracking-wider">修正案</p>
                    <p className="text-slate-800 leading-loose font-medium">
                        {risk.suggestion.revised_text}
                    </p>
                </div>

                {/* Negotiation Message */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400 font-normal tracking-wider">交渉メッセージ</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-slate-400 hover:text-slate-700 font-normal"
                            onClick={() => navigator.clipboard.writeText(negotiationMessage)}
                        >
                            <span className="mr-1.5">Copy</span>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg text-sm text-slate-600 leading-relaxed font-light">
                        {negotiationMessage}
                    </div>
                </div>
            </div>
        </div>
    );
}

