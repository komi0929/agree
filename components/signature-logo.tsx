"use client";

import { useEffect, useState } from "react";

export function SignatureLogo({ className = "" }: { className?: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay before starting animation for dramatic effect
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Logo with clip-path reveal animation */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* CSS Mask for color control */}
            <div
                className="w-full h-full bg-current transition-all duration-1000 ease-out"
                style={{
                    maskImage: "url(/logo.png)",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskImage: "url(/logo.png)",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(10px)",
                }}
            />
        </div>
    );
}
