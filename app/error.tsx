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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-primary">
                        エラーが発生しました
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                        申し訳ありません。予期しないエラーが発生しました。<br />
                        もう一度お試しいただくか、しばらく時間をおいてアクセスしてください。
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                        onClick={reset}
                        className="rounded-full bg-primary hover:bg-primary/90 text-white hover:text-[#FFD700] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        もう一度試す
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="rounded-full border-primary/20 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                        トップページに戻る
                    </Button>
                </div>
            </div>
        </div>
    );
}
