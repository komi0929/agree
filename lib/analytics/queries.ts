import { createClient } from "@supabase/supabase-js";
import { DailySummary, FunnelStep, TrafficSource, AnalyticsRecord } from "./types";

// Supabase client for server-side queries
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error("Supabase credentials not configured");
    }

    return createClient(url, key);
}

/**
 * Get daily summary for a specific date
 */
export async function getDailySummary(date: string): Promise<DailySummary> {
    const supabase = getSupabaseClient();

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
        .from("analytics_events")
        .select("event_name")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

    if (error) {
        console.error("Error fetching daily summary:", error);
        return { date, pageViews: 0, uploadStarted: 0, analysisCompleted: 0, analysisErrors: 0 };
    }

    const events = data || [];

    return {
        date,
        pageViews: events.filter(e => e.event_name === "page_view").length,
        uploadStarted: events.filter(e => e.event_name === "upload_started").length,
        analysisCompleted: events.filter(e => e.event_name === "analysis_completed").length,
        analysisErrors: events.filter(e => e.event_name === "analysis_error").length,
    };
}

/**
 * Get funnel data for a specific date
 */
export async function getFunnelData(date: string): Promise<FunnelStep[]> {
    const supabase = getSupabaseClient();

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
        .from("analytics_events")
        .select("event_name, session_id")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

    if (error) {
        console.error("Error fetching funnel data:", error);
        return [];
    }

    const events = data || [];

    // Count unique sessions per funnel step
    const pageViews = new Set(events.filter(e => e.event_name === "page_view").map(e => e.session_id)).size;
    const started = new Set(events.filter(e => e.event_name === "started_clicked").map(e => e.session_id)).size;
    const uploaded = new Set(events.filter(e => e.event_name === "upload_started").map(e => e.session_id)).size;
    const completed = new Set(events.filter(e => e.event_name === "analysis_completed").map(e => e.session_id)).size;

    const baseCount = Math.max(pageViews, 1);

    return [
        { name: "訪問", count: pageViews, percentage: 100 },
        { name: "はじめる", count: started, percentage: Math.round((started / baseCount) * 100) },
        { name: "解析開始", count: uploaded, percentage: Math.round((uploaded / baseCount) * 100) },
        { name: "解析完了", count: completed, percentage: Math.round((completed / baseCount) * 100) },
    ];
}

/**
 * Get trend data for the last N days
 */
export async function getTrendData(days: number = 7): Promise<DailySummary[]> {
    const results: DailySummary[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const summary = await getDailySummary(dateStr);
        results.push(summary);
    }

    return results;
}

/**
 * Get traffic source breakdown
 */
export async function getTrafficSources(date: string): Promise<TrafficSource[]> {
    const supabase = getSupabaseClient();

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
        .from("analytics_events")
        .select("referrer")
        .eq("event_name", "page_view")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

    if (error) {
        console.error("Error fetching traffic sources:", error);
        return [];
    }

    const events = data || [];
    const total = events.length || 1;

    // Categorize referrers
    const sources: Record<string, number> = {
        "直接": 0,
        "検索": 0,
        "SNS": 0,
        "その他": 0,
    };

    events.forEach(e => {
        const ref = e.referrer || "";
        if (!ref || ref === "") {
            sources["直接"]++;
        } else if (ref.includes("google") || ref.includes("yahoo") || ref.includes("bing")) {
            sources["検索"]++;
        } else if (ref.includes("twitter") || ref.includes("facebook") || ref.includes("instagram") || ref.includes("x.com")) {
            sources["SNS"]++;
        } else {
            sources["その他"]++;
        }
    });

    return Object.entries(sources).map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
    }));
}

/**
 * Get recent events
 */
export async function getRecentEvents(limit: number = 20): Promise<AnalyticsRecord[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching recent events:", error);
        return [];
    }

    return data || [];
}

/**
 * Insert a new analytics event
 */
export async function insertEvent(event: {
    event_name: string;
    event_data?: Record<string, any>;
    session_id?: string;
    user_agent?: string;
    referrer?: string;
    page_path?: string;
}): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from("analytics_events")
        .insert([event]);

    if (error) {
        console.error("Error inserting event:", error);
        return false;
    }

    return true;
}
