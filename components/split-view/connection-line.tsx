"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ConnectionLineProps {
    /** Whether the connection is active (should be drawn) */
    isActive: boolean;
    /** ID/index of the connected risk */
    riskIndex: number;
    /** Risk level for color styling */
    riskLevel?: "critical" | "high" | "medium" | "low";
    /** Container ref that holds both elements */
    containerRef: React.RefObject<HTMLDivElement>;
    /** Selector or ref for the highlight element in contract viewer */
    highlightSelector?: string;
    /** Selector or ref for the card element in risk panel */
    cardSelector?: string;
}

export function ConnectionLine({
    isActive,
    riskIndex,
    riskLevel = "medium",
    containerRef,
    highlightSelector,
    cardSelector,
}: ConnectionLineProps) {
    const [path, setPath] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    // Get color based on risk level
    const getStrokeColor = () => {
        switch (riskLevel) {
            case "critical": return "#ef4444"; // red-500
            case "high": return "#f97316"; // orange-500
            case "medium": return "#eab308"; // yellow-500
            default: return "#3b82f6"; // blue-500
        }
    };

    const updatePath = useCallback(() => {
        if (!containerRef.current || !isActive) {
            setIsVisible(false);
            return;
        }

        // Find highlight element
        const highlightEl = highlightSelector
            ? containerRef.current.querySelector(highlightSelector) as HTMLElement
            : containerRef.current.querySelector(`[data-risk-index="${riskIndex}"]`) as HTMLElement;

        // Find card element
        const cardEl = cardSelector
            ? containerRef.current.querySelector(cardSelector) as HTMLElement
            : containerRef.current.querySelector(`[data-card-index="${riskIndex}"]`) as HTMLElement;

        if (!highlightEl || !cardEl) {
            setIsVisible(false);
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const highlightRect = highlightEl.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        // Calculate positions relative to container
        const startX = highlightRect.right - containerRect.left;
        const startY = highlightRect.top + highlightRect.height / 2 - containerRect.top;
        const endX = cardRect.left - containerRect.left;
        const endY = cardRect.top + cardRect.height / 2 - containerRect.top;

        // Calculate control points for bezier curve
        const midX = (startX + endX) / 2;
        const controlOffset = Math.min(Math.abs(endX - startX) * 0.5, 100);

        // Create smooth bezier path
        const pathData = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;

        setPath(pathData);
        setIsVisible(true);
    }, [containerRef, isActive, riskIndex, highlightSelector, cardSelector]);

    useEffect(() => {
        if (isActive) {
            updatePath();
            // Update on scroll
            const handleScroll = () => updatePath();
            const leftPane = containerRef.current?.querySelector('.contract-scroll-container');
            const rightPane = containerRef.current?.querySelector('.risk-scroll-container');

            leftPane?.addEventListener('scroll', handleScroll);
            rightPane?.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleScroll);

            return () => {
                leftPane?.removeEventListener('scroll', handleScroll);
                rightPane?.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
            };
        } else {
            setIsVisible(false);
        }
    }, [isActive, updatePath, containerRef]);

    if (!isVisible || !path) return null;

    return (
        <svg
            className="absolute inset-0 pointer-events-none z-30 overflow-visible"
            style={{ width: '100%', height: '100%' }}
        >
            {/* Glow effect */}
            <defs>
                <filter id={`glow-${riskIndex}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background glow line */}
            <path
                d={path}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="6"
                strokeOpacity="0.3"
                strokeLinecap="round"
            />

            {/* Main line */}
            <path
                d={path}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="2"
                strokeLinecap="round"
                filter={`url(#glow-${riskIndex})`}
                className="animate-in fade-in duration-300"
            />

            {/* Start dot */}
            <circle
                cx={path.split(' ')[1]}
                cy={path.split(' ')[2]}
                r="4"
                fill={getStrokeColor()}
                className="animate-in zoom-in duration-300"
            />

            {/* End dot */}
            <circle
                cx={path.split(' ').slice(-2)[0]}
                cy={path.split(' ').slice(-1)[0]}
                r="4"
                fill={getStrokeColor()}
                className="animate-in zoom-in duration-300"
            />
        </svg>
    );
}

/**
 * Simplified connection line manager for the split view
 * Uses data attributes to find elements
 */
export function useConnectionLine(containerRef: React.RefObject<HTMLDivElement | null>) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [linePath, setLinePath] = useState<string>("");
    const [riskLevel, setRiskLevel] = useState<string>("medium");

    const updateLine = useCallback((index: number | null, level?: string) => {
        setActiveIndex(index);
        if (level) setRiskLevel(level);

        if (index === null || !containerRef.current) {
            setLinePath("");
            return;
        }

        // Small delay to ensure DOM is updated
        requestAnimationFrame(() => {
            if (!containerRef.current) return;

            const highlight = containerRef.current.querySelector(`[data-highlight-index="${index}"]`);
            const card = containerRef.current.querySelector(`[data-card-index="${index}"]`);

            if (!highlight || !card) {
                setLinePath("");
                return;
            }

            const containerRect = containerRef.current.getBoundingClientRect();
            const highlightRect = highlight.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();

            // Calculate positions
            const startX = highlightRect.right - containerRect.left;
            const startY = highlightRect.top + highlightRect.height / 2 - containerRect.top;
            const endX = cardRect.left - containerRect.left;
            const endY = cardRect.top + cardRect.height / 2 - containerRect.top;

            // Control points for smooth curve
            const controlOffset = Math.min(Math.abs(endX - startX) * 0.4, 80);

            const path = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
            setLinePath(path);
        });
    }, [containerRef]);

    const getStrokeColor = () => {
        switch (riskLevel) {
            case "critical": return "#ef4444";
            case "high": return "#f97316";
            case "medium": return "#eab308";
            default: return "#3b82f6";
        }
    };

    const LineOverlay = activeIndex !== null && linePath ? (
        <svg
            className="absolute inset-0 pointer-events-none z-30"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
            <defs>
                <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Shadow/glow */}
            <path
                d={linePath}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="8"
                strokeOpacity="0.15"
                strokeLinecap="round"
            />

            {/* Main line */}
            <path
                d={linePath}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="8,4"
                filter="url(#connection-glow)"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    values="0;24"
                    dur="1s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    ) : null;

    return { updateLine, LineOverlay, activeIndex };
}
