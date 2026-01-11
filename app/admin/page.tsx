"use client";

import { useState, useEffect, useCallback } from "react";
import { DailySummary, FunnelStep, TrafficSource, AnalyticsRecord } from "@/lib/analytics/types";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Activity, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardData {
    summary: DailySummary;
    funnel: FunnelStep[];
    trend: DailySummary[];
    sources: TrafficSource[];
    events: AnalyticsRecord[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setDate(today.getDate() - 1); // Default to yesterday
        return today.toISOString().split("T")[0];
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const pin = sessionStorage.getItem("admin_pin");
            const res = await fetch(`/api/analytics/query?type=all&date=${selectedDate}&days=7`, {
                headers: { "x-admin-pin": pin || "" },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await res.json();
            setData(result);
        } catch (e) {
            setError("データの取得に失敗しました");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate previous day comparison
    const getPreviousDayComparison = (current: number, trend: DailySummary[], key: keyof DailySummary): { diff: number; percentage: number } => {
        if (!trend || trend.length < 2) return { diff: 0, percentage: 0 };
        const prevIndex = trend.length - 2;
        const prev = trend[prevIndex]?.[key] as number || 0;
        const diff = current - prev;
        const percentage = prev > 0 ? Math.round((diff / prev) * 100) : current > 0 ? 100 : 0;
        return { diff, percentage };
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button
                        onClick={fetchData}
                        className="rounded-full bg-primary hover:bg-primary/90 text-white"
                    >
                        再試行
                    </Button>
                </div>
            </div>
        );
    }

    const summary = data?.summary || { date: selectedDate, pageViews: 0, uploadStarted: 0, analysisCompleted: 0, analysisErrors: 0 };
    const funnel = data?.funnel || [];
    const trend = data?.trend || [];
    const sources = data?.sources || [];
    const events = data?.events || [];

    const errorRate = summary.uploadStarted > 0
        ? ((summary.analysisErrors / summary.uploadStarted) * 100).toFixed(1)
        : "0.0";

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary" />
                        agree Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">日次メトリクス・ファネル分析</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 bg-white border border-primary/20 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 bg-white border border-primary/20 hover:bg-primary/5 rounded-lg text-primary transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                    title="訪問者数"
                    value={summary.pageViews}
                    comparison={getPreviousDayComparison(summary.pageViews, trend, "pageViews")}
                    icon={<Users className="w-5 h-5" />}
                    color="blue"
                />
                <SummaryCard
                    title="解析開始"
                    value={summary.uploadStarted}
                    comparison={getPreviousDayComparison(summary.uploadStarted, trend, "uploadStarted")}
                    icon={<Activity className="w-5 h-5" />}
                    color="indigo"
                />
                <SummaryCard
                    title="解析完了"
                    value={summary.analysisCompleted}
                    comparison={getPreviousDayComparison(summary.analysisCompleted, trend, "analysisCompleted")}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="green"
                />
                <SummaryCard
                    title="エラー率"
                    value={`${errorRate}%`}
                    comparison={{
                        diff: summary.analysisErrors,
                        percentage: 0
                    }}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="amber"
                    isPercentage
                />
            </div>

            {/* Funnel */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-primary/20 shadow-sm">
                <h2 className="text-lg font-semibold text-primary mb-6">メインファネル</h2>
                <div className="flex items-end justify-between gap-4">
                    {funnel.map((step, i) => (
                        <div key={step.name} className="flex-1 text-center">
                            <div className="text-muted-foreground text-sm mb-2">{step.name}</div>
                            <div
                                className="bg-gradient-to-t from-primary to-primary/60 rounded-t-lg mx-auto transition-all duration-500"
                                style={{
                                    height: `${Math.max(step.percentage * 1.5, 20)}px`,
                                    width: "60%",
                                    opacity: 0.3 + (step.percentage / 100) * 0.7
                                }}
                            />
                            <div className="mt-2">
                                <div className="text-xl font-bold text-primary">{step.count}</div>
                                <div className="text-sm text-muted-foreground">{step.percentage}%</div>
                            </div>
                            {i < funnel.length - 1 && (
                                <div className="text-muted-foreground/30 text-xs mt-2">→</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Trend Chart */}
                <div className="bg-white rounded-xl p-6 border border-primary/20 shadow-sm">
                    <h2 className="text-lg font-semibold text-primary mb-4">過去7日間の推移</h2>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {trend.map((day, i) => {
                            const maxValue = Math.max(...trend.map(d => d.analysisCompleted), 1);
                            const height = (day.analysisCompleted / maxValue) * 100;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-300"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                    <div className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                                        {new Date(day.date).getDate()}日
                                    </div>
                                    <div className="text-xs text-muted-foreground">{day.analysisCompleted}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white rounded-xl p-6 border border-primary/20 shadow-sm">
                    <h2 className="text-lg font-semibold text-primary mb-4">流入元内訳</h2>
                    <div className="space-y-3">
                        {sources.map((source) => (
                            <div key={source.source} className="flex items-center gap-3">
                                <div className="w-20 text-sm text-muted-foreground">{source.source}</div>
                                <div className="flex-1 bg-primary/5 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                                        style={{ width: `${source.percentage}%` }}
                                    />
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-primary font-medium">{source.count}</span>
                                    <span className="text-muted-foreground text-sm ml-1">({source.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event Log */}
            <div className="bg-white rounded-xl p-6 border border-primary/20 shadow-sm">
                <h2 className="text-lg font-semibold text-primary mb-4">直近のイベント</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {events.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">イベントがありません</p>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center gap-4 py-2 px-3 bg-primary/5 rounded-lg text-sm"
                            >
                                <div className="text-muted-foreground w-16">
                                    {new Date(event.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="flex-1">
                                    <span className="text-primary font-mono">{event.event_name}</span>
                                    {event.page_path && (
                                        <span className="text-muted-foreground ml-2">{event.page_path}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Summary Card Component
function SummaryCard({
    title,
    value,
    comparison,
    icon,
    color,
    isPercentage = false,
}: {
    title: string;
    value: number | string;
    comparison: { diff: number; percentage: number };
    icon: React.ReactNode;
    color: "blue" | "indigo" | "green" | "amber";
    isPercentage?: boolean;
}) {
    // Aoki style gradients - all based on primary but with slight variations or just clean white
    // For consistency, we'll use white cards with colored icons/borders

    const iconColors = {
        blue: "text-blue-500",
        indigo: "text-indigo-500",
        green: "text-green-500",
        amber: "text-amber-500",
    };

    const isPositive = comparison.percentage > 0;
    const isNegative = comparison.percentage < 0;

    return (
        <div className="bg-white rounded-xl p-5 border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-sm">{title}</span>
                <span className={iconColors[color]}>{icon}</span>
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{value}</div>
            {!isPercentage && (
                <div className="flex items-center gap-1 text-sm">
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : isNegative ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"}>
                        {isPositive ? "+" : ""}{comparison.percentage}%
                    </span>
                    <span className="text-muted-foreground">前日比</span>
                </div>
            )}
        </div>
    );
}
