// lib/types/contract-input.ts
// 契約書生成の入力データ型定義
//
// [精度向上ログ: 2024-12-25]
// 意図: 契約書生成機能の入力を型安全に管理

export interface ContractInput {
    /** 甲（発注者・クライアント）の名称 */
    clientName: string;

    /** 乙（受注者・ユーザー）の名称/屋号 */
    userName: string;

    /** 報酬金額（税抜） */
    amount: number;

    /** 納期（テキスト形式） */
    deadline: string;

    /** 業務内容（ラフな記述OK） */
    scopeDescription: string;

    /** オプション設定 */
    options: ContractOptions;
}

export interface ContractOptions {
    /** 著作権を譲渡しない（ライセンス契約にする） */
    keepCopyright: boolean;

    /** 着手金を請求する */
    requireDeposit: boolean;

    /** 着手金の割合（0.3 = 30%, 0.5 = 50%） */
    depositRate: number;
}

/** デフォルトのオプション値 */
export const DEFAULT_CONTRACT_OPTIONS: ContractOptions = {
    keepCopyright: true,
    requireDeposit: true,
    depositRate: 0.5,
};

/** デフォルトの入力値 */
export const DEFAULT_CONTRACT_INPUT: ContractInput = {
    clientName: "",
    userName: "",
    amount: 0,
    deadline: "",
    scopeDescription: "",
    options: DEFAULT_CONTRACT_OPTIONS,
};

/** 入力のバリデーション結果 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/** 入力のバリデーション */
export function validateContractInput(input: ContractInput): ValidationResult {
    const errors: string[] = [];

    if (!input.clientName.trim()) {
        errors.push("クライアント名を入力してください");
    }
    if (!input.userName.trim()) {
        errors.push("あなたの名前（屋号）を入力してください");
    }
    if (!input.amount || input.amount <= 0) {
        errors.push("金額を入力してください");
    }
    if (!input.deadline.trim()) {
        errors.push("納期を入力してください");
    }
    if (!input.scopeDescription.trim()) {
        errors.push("業務内容を入力してください");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
