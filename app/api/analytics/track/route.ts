import { NextRequest, NextResponse } from "next/server";
import { insertEvent } from "@/lib/analytics/queries";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { event_name, event_data, session_id, page_path, referrer } = body;

        if (!event_name) {
            return NextResponse.json({ error: "event_name is required" }, { status: 400 });
        }

        // Get user agent from headers
        const userAgent = request.headers.get("user-agent") || "";

        const success = await insertEvent({
            event_name,
            event_data: event_data || {},
            session_id: session_id || null,
            user_agent: userAgent,
            referrer: referrer || null,
            page_path: page_path || null,
        });

        if (!success) {
            return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Track API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
