"use client";

import { useState, useEffect, useCallback } from "react";
import { DailySummary, FunnelStep, TrafficSource, AnalyticsRecord } from "@/lib/analytics/types";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Activity, Users, CheckCircle, AlertTriangle } from "lucide-react";

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
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                    >
                        再試行
                    </button>
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
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        agree Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">日次メトリクス・ファネル分析</p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
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
            <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-6">メインファネル</h2>
                <div className="flex items-end justify-between gap-4">
                    {funnel.map((step, i) => (
                        <div key={step.name} className="flex-1 text-center">
                            <div className="text-slate-400 text-sm mb-2">{step.name}</div>
                            <div
                                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg mx-auto transition-all duration-500"
                                style={{
                                    height: `${Math.max(step.percentage * 1.5, 20)}px`,
                                    width: "60%",
                                    opacity: 0.3 + (step.percentage / 100) * 0.7
                                }}
                            />
                            <div className="mt-2">
                                <div className="text-xl font-bold text-white">{step.count}</div>
                                <div className="text-sm text-slate-400">{step.percentage}%</div>
                            </div>
                            {i < funnel.length - 1 && (
                                <div className="text-slate-600 text-xs mt-2">→</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Trend Chart */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-4">過去7日間の推移</h2>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {trend.map((day, i) => {
                            const maxValue = Math.max(...trend.map(d => d.analysisCompleted), 1);
                            const height = (day.analysisCompleted / maxValue) * 100;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all duration-300"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                    <div className="text-xs text-slate-500 mt-2 truncate w-full text-center">
                                        {new Date(day.date).getDate()}日
                                    </div>
                                    <div className="text-xs text-slate-400">{day.analysisCompleted}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-4">流入元内訳</h2>
                    <div className="space-y-3">
                        {sources.map((source) => (
                            <div key={source.source} className="flex items-center gap-3">
                                <div className="w-20 text-sm text-slate-400">{source.source}</div>
                                <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                                        style={{ width: `${source.percentage}%` }}
                                    />
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-white font-medium">{source.count}</span>
                                    <span className="text-slate-500 text-sm ml-1">({source.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event Log */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4">直近のイベント</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {events.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">イベントがありません</p>
                    ) : (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center gap-4 py-2 px-3 bg-slate-700/50 rounded-lg text-sm"
                            >
                                <div className="text-slate-500 w-16">
                                    {new Date(event.created_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="flex-1">
                                    <span className="text-blue-400 font-mono">{event.event_name}</span>
                                    {event.page_path && (
                                        <span className="text-slate-500 ml-2">{event.page_path}</span>
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
    const colorClasses = {
        blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
        indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
        green: "from-green-500/20 to-green-600/10 border-green-500/30",
        amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    };

    const iconColors = {
        blue: "text-blue-400",
        indigo: "text-indigo-400",
        green: "text-green-400",
        amber: "text-amber-400",
    };

    const isPositive = comparison.percentage > 0;
    const isNegative = comparison.percentage < 0;

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-5 border`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{title}</span>
                <span className={iconColors[color]}>{icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            {!isPercentage && (
                <div className="flex items-center gap-1 text-sm">
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : isNegative ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                        <Minus className="w-4 h-4 text-slate-500" />
                    )}
                    <span className={isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-slate-500"}>
                        {isPositive ? "+" : ""}{comparison.percentage}%
                    </span>
                    <span className="text-slate-500">前日比</span>
                </div>
            )}
        </div>
    );
}
