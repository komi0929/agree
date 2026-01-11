"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Loader2, AlertCircle, XCircle } from "lucide-react";
import { extractPartiesAction } from "@/app/actions";
import { ExtractionResult } from "@/lib/types/analysis";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics/client";

interface UploadSectionProps {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: ExtractionResult | null, text?: string) => void;
}

export function UploadSection({ onAnalysisStart, onAnalysisComplete }: UploadSectionProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [url, setUrl] = useState("");
    const [textInput, setTextInput] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleFileSelect(file: File) {
        if (!file) return;

        // Client-side size validation
        const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB
        if (file.size > MAX_FILE_SIZE) {
            setError("ファイルサイズが大きすぎます（最大4.5MB）。これより大きいファイルは確認できません。");
            trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "file_too_large", size: file.size });
            return;
        }

        setIsUploading(true);
        onAnalysisStart();
        trackEvent(ANALYTICS_EVENTS.UPLOAD_STARTED, { type: "file" });

        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await extractPartiesAction(null, formData);
            if (result.success && result.data) {
                onAnalysisComplete(result.data, result.text);
            } else {
                // A-3: More specific error messages
                let errorMessage = result.message || "確認に失敗しました";
                if (errorMessage.includes("テキストが少な") || errorMessage.includes("text")) {
                    errorMessage = "このPDFはスキャン画像の可能性があります。テキストが埋め込まれたPDFをお使いください。";
                } else if (errorMessage.includes("抽出")) {
                    errorMessage = "PDFからテキストを抽出できませんでした。別のPDFファイルをお試しください。";
                }
                setError(errorMessage);
                trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "server_error", message: errorMessage });
                onAnalysisComplete(null);
            }
        } catch (e: unknown) {
            console.error(e);
            // Handle Server Action errors (including "unexpected response")
            let errorMessage = "予期しないエラーが発生しました。";
            if (e instanceof Error) {
                if (e.message.includes("unexpected response")) {
                    errorMessage = "サーバーとの通信でエラーが発生しました。しばらく待ってから再度お試しください。";
                } else {
                    errorMessage = e.message;
                }
            }
            setError(errorMessage);
            trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "upload_error", message: errorMessage });
            onAnalysisComplete(null);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleUrlAnalysis() {
        if (!url) return;

        setError(null); // Clear previous errors
        setIsUploading(true);
        onAnalysisStart();

        const formData = new FormData();
        formData.append("url", url);

        try {
            const result = await extractPartiesAction(null, formData);
            if (result.success && result.data) {
                onAnalysisComplete(result.data, result.text);
            } else {
                const errorMessage = result.message || "確認に失敗しました";
                setError(errorMessage);
                onAnalysisComplete(null);
            }
        } catch (e: unknown) {
            console.error(e);
            let errorMessage = "予期しないエラーが発生しました。";
            if (e instanceof Error) {
                if (e.message.includes("unexpected response")) {
                    errorMessage = "サーバーとの通信でエラーが発生しました。";
                } else {
                    errorMessage = e.message;
                }
            }
            setError(errorMessage);
            onAnalysisComplete(null);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleTextAnalysis() {
        if (!textInput.trim()) return;

        setError(null);
        setIsUploading(true);
        onAnalysisStart();
        trackEvent(ANALYTICS_EVENTS.UPLOAD_STARTED, { type: "text" });

        const formData = new FormData();
        formData.append("text", textInput);

        try {
            const result = await extractPartiesAction(null, formData);
            if (result.success && result.data) {
                onAnalysisComplete(result.data, result.text);
            } else {
                const errorMessage = result.message || "確認に失敗しました";
                setError(errorMessage);
                onAnalysisComplete(null);
            }
        } catch (e: unknown) {
            console.error(e);
            let errorMessage = "予期しないエラーが発生しました。";
            if (e instanceof Error) {
                if (e.message.includes("unexpected response")) {
                    errorMessage = "サーバーとの通信でエラーが発生しました。";
                } else {
                    errorMessage = e.message;
                }
            }
            setError(errorMessage);
            trackEvent(ANALYTICS_EVENTS.ANALYSIS_ERROR, { reason: "text_upload_error", message: errorMessage });
            onAnalysisComplete(null);
        } finally {
            setIsUploading(false);
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full font-sans animate-fade-in">
            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">エラーが発生しました</p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                </div>
            )}

            <Tabs defaultValue="upload" className="w-full" onValueChange={() => setError(null)}>
                <TabsList className="grid w-full max-w-[340px] grid-cols-3 mb-8 bg-slate-100/50 p-1 rounded-full mx-auto">
                    <TabsTrigger value="upload" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">PDFをわたす</TabsTrigger>
                    <TabsTrigger value="url" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">URLを教える</TabsTrigger>
                    <TabsTrigger value="text" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">コピペする</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <div
                        className={`flex flex-col items-center justify-center space-y-4 py-16 border border-dashed rounded-xl transition-all duration-300 cursor-pointer group
                      ${dragActive ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-upload")?.click()}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                <p className="text-xs font-light text-primary/80 tracking-wider">見ているよ...👀</p>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="h-8 w-8 text-primary/40 group-hover:text-primary/60 transition-colors" />
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-primary/80 font-medium">ここに契約書をポンと置いてね 📄</p>
                                    {/* A-4: Clearer prerequisites */}
                                    <p className="text-[10px] text-slate-400 tracking-wide">PDF形式 / 4.5MBまで</p>
                                    <p className="text-[9px] text-slate-300">※スキャン・画像PDFは非対応</p>
                                </div>
                            </>
                        )}
                        <input
                            id="file-upload"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={onFileInputChange}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Privacy Notice */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">サーバー保存なし</span>
                        <span>•</span>
                        <span>AI学習に使用しません</span>
                        <span>•</span>
                        <span>SSL暗号化</span>
                    </div>
                </TabsContent>

                <TabsContent value="url">
                    <div className="space-y-6 max-w-sm mx-auto pt-4">
                        <div className="space-y-2">
                            {/* A-3: Clearer URL input label */}
                            <p className="text-xs text-slate-500 text-center">PDFファイルの直接URL</p>
                            <Input
                                placeholder="https://example.com/contract.pdf"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isUploading}
                                className="rounded-lg border-slate-200 focus-visible:ring-0 focus-visible:border-slate-400 bg-slate-50/50 text-center font-light placeholder:text-slate-300"
                            />
                        </div>
                        {/* B-2: Specific button label */}
                        <Button
                            type="button"
                            className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm transition-all font-medium text-sm"
                            disabled={isUploading || !url}
                            onClick={async (e) => {
                                e.preventDefault();
                                await handleUrlAnalysis();
                            }}
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs">見ているよ...</span>
                                </div>
                            ) : "この契約書を見てもらう 👀"}
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="text">
                    <div className="space-y-6 max-w-lg mx-auto pt-4">
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 text-center">契約書のテキストを直接貼り付け</p>
                            <textarea
                                placeholder="ここに契約書の本文をコピペしてね。すぐに目を通すよ！👀"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                disabled={isUploading}
                                className="w-full h-48 p-4 rounded-xl border-slate-200 focus:ring-0 focus:border-slate-400 bg-slate-50/50 font-light placeholder:text-slate-400 resize-none text-sm"
                            />
                        </div>
                        <Button
                            type="button"
                            className="w-full h-10 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm transition-all font-medium text-sm"
                            disabled={isUploading || !textInput.trim()}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Text analysis started via button click");
                                await handleTextAnalysis();
                            }}
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs">見ているよ...</span>
                                </div>
                            ) : "マネージャーにチェックを頼む 🛡️"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
