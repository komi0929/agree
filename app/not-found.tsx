import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <FileQuestion className="w-8 h-8 text-slate-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-slate-200">404</h1>
                    <h2 className="text-xl font-bold text-slate-900">
                        ページが見つかりません
                    </h2>
                    <p className="text-slate-500 leading-relaxed">
                        お探しのページは存在しないか、移動した可能性があります。
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/">
                        <Button className="rounded-full bg-slate-900 hover:bg-slate-800">
                            <Home className="w-4 h-4 mr-2" />
                            トップページに戻る
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
