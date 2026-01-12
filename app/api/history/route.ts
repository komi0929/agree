import { NextRequest, NextResponse } from "next/server";
import { createClient as createClientRaw, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/auth/supabase-server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client with service role (lazy initialization)
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }
    if (!supabaseAdmin) {
        supabaseAdmin = createClientRaw(supabaseUrl, supabaseServiceKey);
    }
    return supabaseAdmin;
}

export async function GET(request: NextRequest) {
    const client = getSupabaseAdmin();
    if (!client) {
        return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    try {
        // Authenticate via Cookie (SSR)
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user's analysis history
        const { data: history, error } = await client
            .from("analysis_history")
            .select("id, title, contract_type, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching history:", error);
            return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
        }

        return NextResponse.json({ history });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const client = getSupabaseAdmin();
    if (!client) {
        return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    try {
        // Authenticate via Cookie (SSR)
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, contract_text, analysis_result, contract_type } = body;

        if (!title || !contract_text || !analysis_result) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Insert new history entry
        const { data, error } = await client
            .from("analysis_history")
            .insert({
                user_id: user.id,
                title,
                contract_text,
                analysis_result,
                contract_type,
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving history:", error);
            return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
        }

        return NextResponse.json({ history: data });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
