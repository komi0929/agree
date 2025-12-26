// Analytics Event Types for agree

export const ANALYTICS_EVENTS = {
    // Page views
    PAGE_VIEW: 'page_view',

    // Analysis flow
    STARTED_CLICKED: 'started_clicked',       // 「はじめる」クリック
    FILE_SELECTED: 'file_selected',           // ファイル選択
    UPLOAD_STARTED: 'upload_started',         // アップロード開始
    USER_CONTEXT_COMPLETED: 'user_context_completed', // ユーザー情報入力完了
    ROLE_SELECTED: 'role_selected',           // 立場選択
    ANALYSIS_STARTED: 'analysis_started',     // 解析開始
    ANALYSIS_COMPLETED: 'analysis_completed', // 解析完了
    ANALYSIS_ERROR: 'analysis_error',         // エラー発生

    // Result interactions
    RESULT_VIEWED: 'result_viewed',           // 結果画面表示
    RISK_EXPANDED: 'risk_expanded',           // リスク詳細展開
    SUGGESTION_COPIED: 'suggestion_copied',   // 修正案コピー
    MESSAGE_COPIED: 'message_copied',         // 交渉メッセージコピー

    // Repeat usage
    NEW_ANALYSIS_CLICKED: 'new_analysis_clicked', // 新規解析クリック
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface AnalyticsEvent {
    event_name: AnalyticsEventName;
    event_data?: Record<string, any>;
    page_path?: string;
    referrer?: string;
    session_id?: string;
}

export interface AnalyticsRecord extends AnalyticsEvent {
    id: string;
    user_agent?: string;
    created_at: string;
}

// Dashboard metrics types
export interface DailySummary {
    date: string;
    pageViews: number;
    uploadStarted: number;
    analysisCompleted: number;
    analysisErrors: number;
}

export interface FunnelStep {
    name: string;
    count: number;
    percentage: number;
}

export interface TrafficSource {
    source: string;
    count: number;
    percentage: number;
}
