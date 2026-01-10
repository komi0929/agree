/**
 * Anonymous Usage Tracking
 * Tracks contract analysis usage for non-authenticated users
 * 
 * Uses localStorage to persist usage counts across sessions.
 * Resets monthly to allow continued free usage.
 */

const STORAGE_KEY_CHECK_COUNT = "agree_check_count";
const STORAGE_KEY_MONTH = "agree_usage_month";

// Limits
export const ANONYMOUS_CHECK_LIMIT = 3;
export const REGISTERED_CHECK_LIMIT = 10;
export const REGISTERED_GENERATION_LIMIT = 5;

/**
 * Get current month as YYYY-MM string
 */
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Check if we need to reset the counter (new month)
 */
function checkAndResetIfNewMonth(): void {
    if (typeof window === "undefined") return;

    const storedMonth = localStorage.getItem(STORAGE_KEY_MONTH);
    const currentMonth = getCurrentMonth();

    if (storedMonth !== currentMonth) {
        // New month - reset counter
        localStorage.setItem(STORAGE_KEY_CHECK_COUNT, "0");
        localStorage.setItem(STORAGE_KEY_MONTH, currentMonth);
    }
}

/**
 * Get current check count for anonymous user
 */
export function getAnonymousCheckCount(): number {
    if (typeof window === "undefined") return 0;

    checkAndResetIfNewMonth();
    const count = localStorage.getItem(STORAGE_KEY_CHECK_COUNT);
    return count ? parseInt(count, 10) : 0;
}

/**
 * Get remaining check count for anonymous user
 */
export function getAnonymousRemainingChecks(): number {
    return Math.max(0, ANONYMOUS_CHECK_LIMIT - getAnonymousCheckCount());
}

/**
 * Check if anonymous user has reached their monthly limit
 */
export function hasAnonymousReachedCheckLimit(): boolean {
    return getAnonymousCheckCount() >= ANONYMOUS_CHECK_LIMIT;
}

/**
 * Increment check count for anonymous user
 * Returns true if successful, false if limit reached
 */
export function incrementAnonymousCheckCount(): boolean {
    if (typeof window === "undefined") return false;

    checkAndResetIfNewMonth();

    const currentCount = getAnonymousCheckCount();
    if (currentCount >= ANONYMOUS_CHECK_LIMIT) {
        return false;
    }

    localStorage.setItem(STORAGE_KEY_CHECK_COUNT, String(currentCount + 1));
    return true;
}

/**
 * Clear anonymous usage data (for testing purposes)
 */
export function clearAnonymousUsage(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_CHECK_COUNT);
    localStorage.removeItem(STORAGE_KEY_MONTH);
}
