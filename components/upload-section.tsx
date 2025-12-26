"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Loader2 } from "lucide-react";
import { extractPartiesAction } from "@/app/actions";
import { ExtractionResult } from "@/lib/types/analysis";

interface UploadSectionProps {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: ExtractionResult | null, text?: string) => void;
}

export function UploadSection({ onAnalysisStart, onAnalysisComplete }: UploadSectionProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [url, setUrl] = useState("");

    async function handleFileSelect(file: File) {
        if (!file) return;

        setIsUploading(true);
        onAnalysisStart();

        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await extractPartiesAction(null, formData);
            if (result.success && result.data) {
                onAnalysisComplete(result.data, result.text);
            } else {
                alert(result.message || "解析に失敗しました");
                onAnalysisComplete(null);
            }
        } catch (e: any) {
            console.error(e);
            alert(`エラーが発生しました: ${e.message}`);
            onAnalysisComplete(null);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleUrlAnalysis() {
        if (!url) return;

        setIsUploading(true);
        onAnalysisStart();

        const formData = new FormData();
        formData.append("url", url);

        try {
            const result = await extractPartiesAction(null, formData);
            if (result.success && result.data) {
                onAnalysisComplete(result.data, result.text);
            } else {
                alert(result.message || "解析に失敗しました");
                onAnalysisComplete(null);
            }
        } catch (e) {
            console.error(e);
            alert("エラーが発生しました");
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
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full max-w-[200px] grid-cols-2 mb-8 bg-slate-100/50 p-1 rounded-full mx-auto">
                    <TabsTrigger value="upload" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">ファイル</TabsTrigger>
                    <TabsTrigger value="url" className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-300">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <div
                        className={`flex flex-col items-center justify-center space-y-4 py-16 border border-dashed rounded-xl transition-all duration-300 cursor-pointer group
                      ${dragActive ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-upload")?.click()}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="h-6 w-6 text-slate-800 animate-spin" />
                                <p className="text-xs font-light text-slate-500 tracking-wider">読み込んでいます...</p>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="h-6 w-6 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-slate-600 font-light">ここにファイルをドロップ</p>
                                    <p className="text-[10px] text-slate-400 tracking-wide">PDF / 10MBまで</p>
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
                </TabsContent>

                <TabsContent value="url">
                    <div className="space-y-6 max-w-sm mx-auto pt-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="https://example.com/contract.pdf"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isUploading}
                                className="rounded-lg border-slate-200 focus-visible:ring-0 focus-visible:border-slate-400 bg-slate-50/50 text-center font-light placeholder:text-slate-300"
                            />
                        </div>
                        <Button
                            className="w-full h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-none transition-all font-normal text-sm"
                            disabled={isUploading || !url}
                            onClick={handleUrlAnalysis}
                        >
                            {isUploading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs">解析中</span>
                                </div>
                            ) : "解析する"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
