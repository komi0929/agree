"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service (optional)
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        エラーが発生しました
                    </h1>
                    <p className="text-slate-500 leading-relaxed">
                        申し訳ありません。予期しないエラーが発生しました。<br />
                        もう一度お試しいただくか、しばらく時間をおいてアクセスしてください。
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                        onClick={reset}
                        className="rounded-full bg-slate-900 hover:bg-slate-800"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        もう一度試す
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="rounded-full border-slate-200"
                    >
                        トップページに戻る
                    </Button>
                </div>
            </div>
        </div>
    );
}
