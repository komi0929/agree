import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client with service role (lazy initialization)
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }
    if (!supabaseAdmin) {
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
    return supabaseAdmin;
}

// GET a specific history item by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = getSupabaseAdmin();
    if (!client) {
        return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    try {
        const { id } = await params;

        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await client.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Fetch the specific history item
        const { data: history, error } = await client
            .from("analysis_history")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (error || !history) {
            return NextResponse.json({ error: "History not found" }, { status: 404 });
        }

        return NextResponse.json({ history });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE a history item
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = getSupabaseAdmin();
    if (!client) {
        return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    try {
        const { id } = await params;

        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await client.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { error } = await client
            .from("analysis_history")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
