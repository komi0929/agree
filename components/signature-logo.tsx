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
        <div className={`relative ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logo.png"
                alt="agree logo"
                className={`w-full h-auto transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
                    }`}
                style={{
                    maxHeight: "100%",
                    objectFit: "contain",
                    // Compensate for whitespace in the original PNG
                    marginTop: "-12%",
                    marginBottom: "-12%"
                }}
            />
        </div>
    );
}
