"use client";

/**
 * Local-First Storage using IndexedDB
 * Provides zero-latency history access and offline support
 * 
 * Nani Philosophy: Network latency = 0ms for cached data
 */

import { EnhancedAnalysisResult } from "@/lib/types/analysis";

// Database configuration
const DB_NAME = "agree-local-db";
const DB_VERSION = 1;
const STORE_ANALYSES = "analyses";
const STORE_CONTRACTS = "contracts";

// Types
export interface StoredAnalysis {
    id: string;
    timestamp: number;
    contractHash: string;
    contractPreview: string; // First 200 chars
    contractType?: string;
    riskCount: number;
    criticalCount: number;
    data: EnhancedAnalysisResult;
}

export interface StoredContract {
    hash: string;
    text: string;
    timestamp: number;
}

// Simple hash function for contract deduplication
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

// Database connection (lazy singleton)
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            reject(new Error("IndexedDB not available"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Analyses store - stores analysis results
            if (!db.objectStoreNames.contains(STORE_ANALYSES)) {
                const analysesStore = db.createObjectStore(STORE_ANALYSES, { keyPath: "id" });
                analysesStore.createIndex("timestamp", "timestamp", { unique: false });
                analysesStore.createIndex("contractHash", "contractHash", { unique: false });
            }

            // Contracts store - stores full contract text (deduplicated)
            if (!db.objectStoreNames.contains(STORE_CONTRACTS)) {
                db.createObjectStore(STORE_CONTRACTS, { keyPath: "hash" });
            }
        };
    });

    return dbPromise;
}

// ============================================
// Public API
// ============================================

/**
 * Save an analysis result to local storage
 * Returns the generated ID
 */
export async function saveAnalysis(
    text: string,
    data: EnhancedAnalysisResult,
    contractType?: string
): Promise<string> {
    try {
        const db = await getDB();
        const contractHash = hashString(text);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // Count risks
        const riskCount = data.risks.filter(r => r.risk_level !== "low").length;
        const criticalCount = data.risks.filter(r => r.risk_level === "critical").length;

        const storedAnalysis: StoredAnalysis = {
            id,
            timestamp: Date.now(),
            contractHash,
            contractPreview: text.slice(0, 200).replace(/\s+/g, " "),
            contractType: contractType || data.contract_classification,
            riskCount,
            criticalCount,
            data,
        };

        // Store analysis
        const txAnalysis = db.transaction(STORE_ANALYSES, "readwrite");
        const analysesStore = txAnalysis.objectStore(STORE_ANALYSES);
        analysesStore.put(storedAnalysis);

        // Store contract text (deduplicated by hash)
        const storedContract: StoredContract = {
            hash: contractHash,
            text,
            timestamp: Date.now(),
        };

        const txContract = db.transaction(STORE_CONTRACTS, "readwrite");
        const contractsStore = txContract.objectStore(STORE_CONTRACTS);
        contractsStore.put(storedContract);

        return id;
    } catch (error) {
        console.error("Failed to save analysis:", error);
        throw error;
    }
}

/**
 * Get recent analyses (sorted by timestamp, newest first)
 */
export async function getRecentAnalyses(limit = 10): Promise<StoredAnalysis[]> {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_ANALYSES, "readonly");
        const store = tx.objectStore(STORE_ANALYSES);
        const index = store.index("timestamp");

        return new Promise((resolve, reject) => {
            const results: StoredAnalysis[] = [];
            const request = index.openCursor(null, "prev"); // Descending order

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    } catch (error) {
        console.error("Failed to get recent analyses:", error);
        return [];
    }
}

/**
 * Get a specific analysis by ID
 */
export async function getAnalysis(id: string): Promise<StoredAnalysis | null> {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_ANALYSES, "readonly");
        const store = tx.objectStore(STORE_ANALYSES);

        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get analysis:", error);
        return null;
    }
}

/**
 * Get contract text by hash
 */
export async function getContractText(hash: string): Promise<string | null> {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_CONTRACTS, "readonly");
        const store = tx.objectStore(STORE_CONTRACTS);

        return new Promise((resolve, reject) => {
            const request = store.get(hash);
            request.onsuccess = () => resolve(request.result?.text || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get contract text:", error);
        return null;
    }
}

/**
 * Delete an analysis by ID
 */
export async function deleteAnalysis(id: string): Promise<void> {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_ANALYSES, "readwrite");
        const store = tx.objectStore(STORE_ANALYSES);
        store.delete(id);
    } catch (error) {
        console.error("Failed to delete analysis:", error);
    }
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<void> {
    try {
        const db = await getDB();

        const txAnalyses = db.transaction(STORE_ANALYSES, "readwrite");
        txAnalyses.objectStore(STORE_ANALYSES).clear();

        const txContracts = db.transaction(STORE_CONTRACTS, "readwrite");
        txContracts.objectStore(STORE_CONTRACTS).clear();
    } catch (error) {
        console.error("Failed to clear data:", error);
    }
}

/**
 * Get total count of stored analyses
 */
export async function getAnalysisCount(): Promise<number> {
    try {
        const db = await getDB();
        const tx = db.transaction(STORE_ANALYSES, "readonly");
        const store = tx.objectStore(STORE_ANALYSES);

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get analysis count:", error);
        return 0;
    }
}

/**
 * Check if IndexedDB is available
 */
export function isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && !!window.indexedDB;
}
