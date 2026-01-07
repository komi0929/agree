"use client";

import { useRef, useCallback, useMemo, KeyboardEvent } from "react";

/**
 * IME-aware input hook based on Nani's use-chat-submit philosophy
 * Prevents accidental submissions during Japanese/Chinese/Korean text composition
 * 
 * Key features:
 * - IME composition state tracking
 * - Platform-agnostic modifier key detection (Cmd for Mac, Ctrl for Win/Linux)
 * - Zero dependencies
 */

export type SubmitMode = "enter" | "mod-enter" | "shift-enter";

export interface UseContractSubmitOptions {
    onSubmit: () => void;
    mode?: SubmitMode;
    disabled?: boolean;
}

export interface UseContractSubmitReturn {
    // Props to spread on textarea/input
    getInputProps: () => {
        onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
        onCompositionStart: () => void;
        onCompositionEnd: () => void;
    };
    // Hint text for UI display
    hint: string;
    // Platform info
    isMac: boolean;
}

/**
 * Hook for IME-safe text submission
 * 
 * Usage:
 * ```tsx
 * const { getInputProps, hint } = useContractSubmit({
 *   onSubmit: () => handleSubmit(),
 *   mode: "mod-enter"
 * });
 * 
 * return (
 *   <>
 *     <textarea {...getInputProps()} />
 *     <span>{hint}</span>
 *   </>
 * );
 * ```
 */
export function useContractSubmit({
    onSubmit,
    mode = "mod-enter",
    disabled = false
}: UseContractSubmitOptions): UseContractSubmitReturn {
    // Track IME composition state
    const isComposing = useRef(false);

    // Detect platform (memoized to avoid re-running)
    const isMac = useMemo(() => {
        if (typeof window === "undefined") return false;
        return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    }, []);

    // Handle keydown with IME awareness
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        // Guard 1: Skip if disabled
        if (disabled) return;

        // Guard 2: Skip if IME is composing (most critical for CJK languages)
        // This prevents submitting half-finished Japanese/Chinese text
        if (isComposing.current) return;

        // Guard 3: Double-check using native event's isComposing property
        // Some browsers may have timing differences with composition events
        if (e.nativeEvent.isComposing) return;

        // Only process Enter key
        if (e.key !== "Enter") return;

        // Check modifier keys based on mode
        const modifierPressed = isMac ? e.metaKey : e.ctrlKey;

        let shouldSubmit = false;

        switch (mode) {
            case "enter":
                // Plain enter submits (Shift+Enter for newline)
                shouldSubmit = !e.shiftKey && !modifierPressed;
                break;

            case "mod-enter":
                // Cmd+Enter (Mac) or Ctrl+Enter (Win/Linux) submits
                shouldSubmit = modifierPressed && !e.shiftKey;
                break;

            case "shift-enter":
                // Shift+Enter submits
                shouldSubmit = e.shiftKey && !modifierPressed;
                break;
        }

        if (shouldSubmit) {
            e.preventDefault(); // Prevent newline insertion
            onSubmit();
        }
    }, [disabled, isMac, mode, onSubmit]);

    // Composition event handlers
    const handleCompositionStart = useCallback(() => {
        isComposing.current = true;
    }, []);

    const handleCompositionEnd = useCallback(() => {
        // Small delay to ensure the composition is truly finished
        // This helps with browser timing differences
        setTimeout(() => {
            isComposing.current = false;
        }, 10);
    }, []);

    // Generate input props
    const getInputProps = useCallback(() => ({
        onKeyDown: handleKeyDown,
        onCompositionStart: handleCompositionStart,
        onCompositionEnd: handleCompositionEnd,
    }), [handleKeyDown, handleCompositionStart, handleCompositionEnd]);

    // Generate hint text based on mode and platform
    const hint = useMemo(() => {
        switch (mode) {
            case "enter":
                return "⏎ で送信";
            case "mod-enter":
                return isMac ? "⌘ + ⏎ で送信" : "Ctrl + ⏎ で送信";
            case "shift-enter":
                return "Shift + ⏎ で送信";
            default:
                return "";
        }
    }, [mode, isMac]);

    return {
        getInputProps,
        hint,
        isMac,
    };
}

/**
 * Standalone function to detect platform
 * Useful for non-hook contexts
 */
export function detectPlatform(): { isMac: boolean; isWindows: boolean; isLinux: boolean } {
    if (typeof window === "undefined") {
        return { isMac: false, isWindows: false, isLinux: false };
    }

    const platform = navigator.platform;
    return {
        isMac: /Mac|iPod|iPhone|iPad/.test(platform),
        isWindows: /Win/.test(platform),
        isLinux: /Linux/.test(platform),
    };
}

/**
 * Get the appropriate modifier key name for the current platform
 */
export function getModifierKeyName(): string {
    const { isMac } = detectPlatform();
    return isMac ? "⌘" : "Ctrl";
}
