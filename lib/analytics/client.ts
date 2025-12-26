"use client";

import { AnalyticsEventName, ANALYTICS_EVENTS } from "./types";

// Generate a simple session ID (persisted in sessionStorage)
function getSessionId(): string {
    if (typeof window === "undefined") return "";

    let sessionId = sessionStorage.getItem("agree_session_id");
    if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("agree_session_id", sessionId);
    }
    return sessionId;
}

/**
 * Track an analytics event
 * Sends event data to /api/analytics/track endpoint
 */
export async function trackEvent(
    eventName: AnalyticsEventName,
    eventData?: Record<string, any>
): Promise<void> {
    try {
        const payload = {
            event_name: eventName,
            event_data: eventData || {},
            page_path: typeof window !== "undefined" ? window.location.pathname : "",
            referrer: typeof document !== "undefined" ? document.referrer : "",
            session_id: getSessionId(),
        };

        // Fire and forget - don't block UI
        fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(() => {
            // Silently fail - analytics should never break the app
        });
    } catch {
        // Silently fail
    }
}

/**
 * Track a page view event
 */
export function trackPageView(pagePath?: string): void {
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
        path: pagePath || (typeof window !== "undefined" ? window.location.pathname : ""),
    });
}

/**
 * Export event names for convenience
 */
export { ANALYTICS_EVENTS };
