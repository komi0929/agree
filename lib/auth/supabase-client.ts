import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization to prevent build-time errors when env vars are not set
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
}

// Export getter for convenience (throws if not configured)
export const supabase = {
    get client(): SupabaseClient {
        const client = getSupabaseClient();
        if (!client) {
            throw new Error("Supabase environment variables are not configured");
        }
        return client;
    },
    get auth() {
        return this.client.auth;
    },
    from(table: string) {
        return this.client.from(table);
    }
};

// Types for database tables
export interface UserProfile {
    id: string;
    email: string;
    display_name: string | null;
    plan: 'free' | 'pro';
    usage_count_this_month: number;
    usage_reset_at: string;
    created_at: string;
    updated_at: string;
}

export interface AnalysisHistoryItem {
    id: string;
    user_id: string;
    title: string;
    contract_text: string;
    analysis_result: unknown;
    contract_type: string | null;
    created_at: string;
}

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}
