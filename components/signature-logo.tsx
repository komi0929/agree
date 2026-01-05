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
            <img
                src="/logo.png"
                alt="agree"
                className="w-full h-full object-contain brightness-0"
                style={{
                    clipPath: isVisible
                        ? "inset(0 0% 0 0)"
                        : "inset(0 100% 0 0)",
                    transition: "clip-path 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            />
        </div>
    );
}
