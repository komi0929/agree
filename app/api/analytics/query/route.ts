import { NextRequest, NextResponse } from "next/server";
import {
    getDailySummary,
    getFunnelData,
    getTrendData,
    getTrafficSources,
    getRecentEvents
} from "@/lib/analytics/queries";

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const adminPin = request.headers.get("x-admin-pin");
        const expectedPin = process.env.ADMIN_PIN;

        if (!expectedPin || adminPin !== expectedPin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const queryType = searchParams.get("type");
        const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
        const days = parseInt(searchParams.get("days") || "7");

        switch (queryType) {
            case "summary":
                const summary = await getDailySummary(date);
                return NextResponse.json(summary);

            case "funnel":
                const funnel = await getFunnelData(date);
                return NextResponse.json(funnel);

            case "trend":
                const trend = await getTrendData(days);
                return NextResponse.json(trend);

            case "sources":
                const sources = await getTrafficSources(date);
                return NextResponse.json(sources);

            case "events":
                const limit = parseInt(searchParams.get("limit") || "20");
                const events = await getRecentEvents(limit);
                return NextResponse.json(events);

            case "all":
                // Get all data for dashboard
                const [allSummary, allFunnel, allTrend, allSources, allEvents] = await Promise.all([
                    getDailySummary(date),
                    getFunnelData(date),
                    getTrendData(days),
                    getTrafficSources(date),
                    getRecentEvents(20),
                ]);
                return NextResponse.json({
                    summary: allSummary,
                    funnel: allFunnel,
                    trend: allTrend,
                    sources: allSources,
                    events: allEvents,
                });

            default:
                return NextResponse.json({ error: "Invalid query type" }, { status: 400 });
        }
    } catch (error) {
        console.error("Query API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
