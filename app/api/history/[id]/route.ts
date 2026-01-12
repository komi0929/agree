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

        try {
            const { id } = await params;

            // Authenticate via Cookie (SSR)
            const supabase = await createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

            try {
                const { id } = await params;

                // Authenticate via Cookie (SSR)
                const supabase = await createClient();
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
