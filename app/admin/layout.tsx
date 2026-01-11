"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already authenticated in session
        const storedPin = sessionStorage.getItem("admin_pin");
        if (storedPin) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Verify PIN by making a test request
        try {
            const res = await fetch("/api/analytics/query?type=summary", {
                headers: { "x-admin-pin": pin },
            });

            if (res.ok) {
                sessionStorage.setItem("admin_pin", pin);
                setIsAuthenticated(true);
            } else {
                setError("PINが正しくありません");
            }
        } catch {
            setError("認証に失敗しました");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground">読み込み中...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-primary/20">
                        <div className="text-center mb-8">
                            <div className="text-3xl mb-2">🔒</div>
                            <h1 className="text-xl font-semibold text-primary">Admin Dashboard</h1>
                            <p className="text-muted-foreground text-sm mt-1">管理者PINを入力してください</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="PIN"
                                className="w-full text-center text-lg tracking-widest border-primary/20 focus-visible:ring-primary"
                                autoFocus
                            />

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full rounded-full bg-primary hover:bg-primary/90 text-white hover:text-[#FFD700] transition-colors"
                            >
                                ログイン
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
