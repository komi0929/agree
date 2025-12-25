"use client";
// app/generate/preview/page.tsx
// 契約書生成 - プレビュー＆編集画面

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Check, Send, Mail, FileText, Star } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ContractInput } from "@/lib/types/contract-input";
import { GeneratedContract } from "@/lib/contract-generator";
import { modifyContractAction, generateEmailAction } from "../actions";
import { Footer } from "@/components/footer";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export default function PreviewPage() {
    const router = useRouter();
    const [input, setInput] = useState<ContractInput | null>(null);
    const [contract, setContract] = useState<GeneratedContract | null>(null);
    const [copied, setCopied] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isModifying, setIsModifying] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [emailContent, setEmailContent] = useState<{ subject: string; body: string } | null>(null);
    const [emailCopied, setEmailCopied] = useState(false);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // セッションストレージから取得
        const storedInput = sessionStorage.getItem("contractInput");
        const storedResult = sessionStorage.getItem("contractResult");

        if (!storedInput || !storedResult) {
            router.push("/generate");
            return;
        }

        setInput(JSON.parse(storedInput));
        setContract(JSON.parse(storedResult));
    }, [router]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleCopy = async () => {
        if (!contract) return;
        await navigator.clipboard.writeText(contract.markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !contract || !input || isModifying) return;

        const userMessage = chatInput.trim();
        setChatInput("");
        setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsModifying(true);

        try {
            const result = await modifyContractAction(contract.markdown, userMessage, input);

            if (result.success && result.markdown) {
                setContract(prev => prev ? { ...prev, markdown: result.markdown! } : null);
                setChatMessages(prev => [...prev, { role: "assistant", content: "✅ 修正しました！左側のプレビューをご確認ください。" }]);
            } else {
                setChatMessages(prev => [...prev, { role: "assistant", content: `❌ ${result.error || "修正に失敗しました"}` }]);
            }
        } catch {
            setChatMessages(prev => [...prev, { role: "assistant", content: "❌ エラーが発生しました" }]);
        } finally {
            setIsModifying(false);
        }
    };

    const handleGenerateEmail = async () => {
        if (!input || !contract) return;

        setIsGeneratingEmail(true);
        setShowEmail(true);

        try {
            const result = await generateEmailAction(input, contract.markdown);

            if (result.success && result.data) {
                setEmailContent(result.data);
            }
        } catch {
            setEmailContent({ subject: "エラー", body: "メール生成に失敗しました" });
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    const handleCopyEmail = async () => {
        if (!emailContent) return;
        const fullText = `件名: ${emailContent.subject}\n\n${emailContent.body}`;
        await navigator.clipboard.writeText(fullText);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    };

    if (!contract || !input) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-slate-400 text-sm">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-600 selection:bg-slate-100 selection:text-slate-900">
            {/* Header */}
            <header className="border-b border-slate-100 sticky top-0 z-50 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/generate" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">入力画面に戻る</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleGenerateEmail}
                            className="h-9 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            送付メールを作成
                        </Button>
                        <Button
                            onClick={handleCopy}
                            className="h-9 rounded-full bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    コピーしました
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    契約書をコピー
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left: Preview */}
                <div className="flex-1 border-r border-slate-100 bg-white overflow-auto">
                    <div className="max-w-3xl mx-auto p-8">
                        {/* Highlights */}
                        {contract.highlightedClauses.length > 0 && (
                            <div className="mb-6 p-4 border border-slate-200 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm mb-2">
                                    <Star className="w-4 h-4" />
                                    あなたを守る条項
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {contract.highlightedClauses.map((clause, i) => (
                                        <span key={i} className="text-xs border border-slate-200 text-slate-500 px-2 py-1 rounded-full">
                                            {clause}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contract Markdown */}
                        <div className="prose prose-slate max-w-none prose-headings:font-medium prose-h1:text-xl prose-h2:text-lg prose-p:text-slate-500 prose-p:leading-relaxed prose-p:font-light">
                            <ReactMarkdown
                                components={{
                                    h2: ({ children }) => {
                                        const text = String(children);
                                        const isHighlighted = text.includes("⭐");
                                        return (
                                            <h2 className={isHighlighted ? "text-slate-800 border-l-2 border-slate-400 pl-3 bg-slate-50 py-2 rounded-r" : ""}>
                                                {children}
                                            </h2>
                                        );
                                    },
                                }}
                            >
                                {contract.markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="w-96 bg-white flex flex-col border-l border-slate-100">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4" />
                            AIで修正
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-light">
                            チャットで指示すると契約書を修正します
                        </p>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-50/50">
                        {chatMessages.length === 0 && (
                            <div className="text-center text-slate-400 text-sm py-8">
                                <p className="mb-4 font-light">修正したい内容を入力してください</p>
                                <div className="space-y-2 text-xs">
                                    <p className="bg-white p-2 rounded-lg border border-slate-100">「支払いを月末にして」</p>
                                    <p className="bg-white p-2 rounded-lg border border-slate-100">「もう少し柔らかい表現に」</p>
                                    <p className="bg-white p-2 rounded-lg border border-slate-100">「着手金を30%に変更」</p>
                                </div>
                            </div>
                        )}
                        {chatMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-xl text-sm ${msg.role === "user"
                                    ? "bg-slate-900 text-white ml-8"
                                    : "bg-white border border-slate-100 mr-8"
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isModifying && (
                            <div className="bg-white border border-slate-100 p-3 rounded-xl mr-8">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                                    修正中...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex gap-2">
                            <Input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="修正内容を入力..."
                                className="flex-1 border-slate-200 focus-visible:ring-0 focus-visible:border-slate-400"
                                disabled={isModifying}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isModifying || !chatInput.trim()}
                                className="bg-slate-900 hover:bg-slate-800"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email Modal */}
            {showEmail && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-xl border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-medium text-slate-900">送付用メール</h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyEmail}
                                    disabled={!emailContent || isGeneratingEmail}
                                    className="rounded-full border-slate-200"
                                >
                                    {emailCopied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            コピーしました
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-1" />
                                            コピー
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEmail(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    閉じる
                                </Button>
                            </div>
                        </div>
                        <div className="p-6">
                            {isGeneratingEmail ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                                    <span className="ml-3 text-slate-400 text-sm">メールを生成中...</span>
                                </div>
                            ) : emailContent ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 font-light">件名</p>
                                        <p className="text-sm text-slate-900">{emailContent.subject}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 font-light">本文</p>
                                        <div className="border border-slate-100 p-4 rounded-xl text-sm text-slate-600 whitespace-pre-wrap font-light leading-relaxed">
                                            {emailContent.body}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
