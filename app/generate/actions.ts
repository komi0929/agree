"use server";
// app/generate/actions.ts
// 契約書生成のサーバーアクション

import { generateContract, modifyContract, generateEmail, GeneratedContract, GeneratedEmail } from "@/lib/contract-generator";
import { ContractInput, validateContractInput } from "@/lib/types/contract-input";

export interface GenerateResult {
    success: boolean;
    data?: GeneratedContract;
    error?: string;
}

export interface ModifyResult {
    success: boolean;
    markdown?: string;
    error?: string;
}

export interface EmailResult {
    success: boolean;
    data?: GeneratedEmail;
    error?: string;
}

/**
 * 契約書を生成
 */
export async function generateContractAction(input: ContractInput): Promise<GenerateResult> {
    try {
        // バリデーション
        const validation = validateContractInput(input);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join("\n"),
            };
        }

        console.log("[Contract Generation] Starting with input:", JSON.stringify({
            clientName: input.clientName,
            userName: input.userName,
            amount: input.amount,
            deadline: input.deadline,
            scopeLength: input.scopeDescription?.length || 0,
        }));

        const result = await generateContract(input);

        console.log("[Contract Generation] Success, markdown length:", result.markdown?.length || 0);

        return {
            success: true,
            data: result,
        };
    } catch (error: any) {
        const errorMessage = error?.message || "Unknown error";
        const errorStack = error?.stack || "";
        console.error("[Contract Generation] Error:", errorMessage);
        console.error("[Contract Generation] Stack:", errorStack);

        return {
            success: false,
            error: `契約書の生成中にエラーが発生しました: ${errorMessage}`,
        };
    }
}

/**
 * 契約書を修正
 */
export async function modifyContractAction(
    currentContract: string,
    instruction: string,
    input: ContractInput
): Promise<ModifyResult> {
    try {
        if (!instruction.trim()) {
            return {
                success: false,
                error: "修正内容を入力してください。",
            };
        }

        const markdown = await modifyContract(currentContract, instruction, input);

        return {
            success: true,
            markdown,
        };
    } catch (error) {
        console.error("Contract modification error:", error);
        return {
            success: false,
            error: "契約書の修正中にエラーが発生しました。",
        };
    }
}

/**
 * 送付用メールを生成
 */
export async function generateEmailAction(
    input: ContractInput,
    contractMarkdown: string
): Promise<EmailResult> {
    try {
        const result = await generateEmail(input, contractMarkdown);

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("Email generation error:", error);
        return {
            success: false,
            error: "メールの生成中にエラーが発生しました。",
        };
    }
}
