// lib/cache/analysis-cache.ts
// コンテンツアドレスによる解析結果キャッシュ
//
// [精度向上ログ: 2026-01-09]
// 意図: 同一契約書に対して常に同一の結果を返すことを保証
// 設計判断: テキストのハッシュをキーとしてlocalStorageに保存

import { EnhancedAnalysisResult } from "@/lib/ai-service";
import { UserContext } from "@/lib/types/user-context";

const CACHE_PREFIX = "agree_analysis_cache_";
const CACHE_VERSION = "v1"; // キャッシュバージョン（パターン更新時に変更）
const MAX_CACHE_ENTRIES = 10; // 最大キャッシュ数

export interface CachedAnalysis {
    version: string;
    timestamp: string;
    textHash: string;
    contextHash: string;
    result: EnhancedAnalysisResult;
}

/**
 * テキストを正規化（空白や改行の違いを吸収）
 */
function normalizeText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')      // Windows改行を統一
        .replace(/\r/g, '\n')         // Mac改行を統一
        .replace(/[ \t]+/g, ' ')      // 連続空白を単一に
        .replace(/\n+/g, '\n')        // 連続改行を単一に
        .trim()
        .toLowerCase();
}

/**
 * 簡易ハッシュ関数（crypto不要でブラウザ互換）
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * キャッシュキーを生成
 * テキストとコンテキストの両方をハッシュ化
 */
export function generateCacheKey(text: string, context?: UserContext): string {
    const normalizedText = normalizeText(text);
    const textHash = simpleHash(normalizedText);

    // コンテキストもハッシュに含める（同じ契約でも立場が違えば結果が変わる）
    const contextString = context
        ? JSON.stringify({
            userRole: context.userRole,
            userEntityType: context.userEntityType,
            counterpartyCapital: context.counterpartyCapital,
        })
        : "default";
    const contextHash = simpleHash(contextString);

    return `${CACHE_PREFIX}${CACHE_VERSION}_${textHash}_${contextHash}`;
}

/**
 * キャッシュから結果を取得
 */
export function getCachedAnalysis(text: string, context?: UserContext): CachedAnalysis | null {
    if (typeof window === 'undefined') return null; // SSR対応

    try {
        const key = generateCacheKey(text, context);
        const cached = localStorage.getItem(key);

        if (!cached) return null;

        const parsed: CachedAnalysis = JSON.parse(cached);

        // バージョンチェック
        if (parsed.version !== CACHE_VERSION) {
            localStorage.removeItem(key);
            return null;
        }

        console.log(`[Cache] Hit! Key: ${key.substring(0, 30)}...`);
        return parsed;
    } catch (error) {
        console.error("[Cache] Read error:", error);
        return null;
    }
}

/**
 * 結果をキャッシュに保存
 */
export function setCachedAnalysis(
    text: string,
    context: UserContext | undefined,
    result: EnhancedAnalysisResult
): void {
    if (typeof window === 'undefined') return; // SSR対応

    try {
        const key = generateCacheKey(text, context);
        const textHash = simpleHash(normalizeText(text));
        const contextHash = context
            ? simpleHash(JSON.stringify(context))
            : "default";

        const cached: CachedAnalysis = {
            version: CACHE_VERSION,
            timestamp: new Date().toISOString(),
            textHash,
            contextHash,
            result,
        };

        // 古いキャッシュを削除してから保存（LRU風）
        pruneOldCache();

        localStorage.setItem(key, JSON.stringify(cached));
        console.log(`[Cache] Saved! Key: ${key.substring(0, 30)}...`);
    } catch (error) {
        console.error("[Cache] Write error:", error);
    }
}

/**
 * 古いキャッシュエントリを削除（LRU風）
 */
function pruneOldCache(): void {
    if (typeof window === 'undefined') return;

    try {
        const cacheKeys: { key: string; timestamp: string }[] = [];

        // すべてのキャッシュキーを収集
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                try {
                    const cached = JSON.parse(localStorage.getItem(key) || "{}");
                    cacheKeys.push({ key, timestamp: cached.timestamp || "" });
                } catch {
                    // 破損したエントリは削除
                    localStorage.removeItem(key!);
                }
            }
        }

        // 上限を超えている場合、古い順に削除
        if (cacheKeys.length >= MAX_CACHE_ENTRIES) {
            cacheKeys.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
            const toDelete = cacheKeys.slice(0, cacheKeys.length - MAX_CACHE_ENTRIES + 1);
            for (const { key } of toDelete) {
                localStorage.removeItem(key);
                console.log(`[Cache] Pruned old entry: ${key.substring(0, 30)}...`);
            }
        }
    } catch (error) {
        console.error("[Cache] Prune error:", error);
    }
}

/**
 * すべてのキャッシュをクリア
 */
export function clearAnalysisCache(): void {
    if (typeof window === 'undefined') return;

    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`[Cache] Cleared ${keysToRemove.length} entries`);
    } catch (error) {
        console.error("[Cache] Clear error:", error);
    }
}
