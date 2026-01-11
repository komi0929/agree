import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
            <div className="max-w-md text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center border border-primary/20">
                    <FileQuestion className="w-8 h-8 text-primary/50" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-primary/20">404</h1>
                    <h2 className="text-xl font-bold text-primary">
                        ページが見つかりません
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        お探しのページは存在しないか、移動した可能性があります。
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/">
                        <Button className="rounded-full bg-primary hover:bg-primary/90 text-white hover:text-[#FFD700] transition-colors">
                            <Home className="w-4 h-4 mr-2" />
                            トップページに戻る
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
