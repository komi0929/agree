"use client";

import { useState, useEffect, ReactNode } from "react";

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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-slate-400">読み込み中...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
                        <div className="text-center mb-8">
                            <div className="text-3xl mb-2">🔒</div>
                            <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
                            <p className="text-slate-400 text-sm mt-1">管理者PINを入力してください</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="PIN"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                                autoFocus
                            />

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                            >
                                ログイン
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {children}
        </div>
    );
}
