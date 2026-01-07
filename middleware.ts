import { NextRequest, NextResponse } from "next/server";

/**
 * Edge Runtime middleware for minimum latency
 * Runs on edge nodes closest to the user
 * 
 * Nani Philosophy: Reduce RTT by processing at the edge
 */

export const config = {
    // Apply to all API routes except static assets
    matcher: [
        "/api/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Add performance headers
    response.headers.set("X-Edge-Region", process.env.VERCEL_REGION || "local");
    response.headers.set("X-Response-Time", Date.now().toString());

    // Security headers (supplement to next.config.ts)
    response.headers.set("X-DNS-Prefetch-Control", "on");

    // Preflight CORS for streaming API
    if (request.nextUrl.pathname.startsWith("/api/analyze-stream")) {
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    }

    return response;
}
