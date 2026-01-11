import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-16">
            <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                トップに戻る
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-primary mt-8 mb-3">
                {title}
            </h1>
            {description && (
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
