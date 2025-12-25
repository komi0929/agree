// lib/types/analysis.ts
// Type definitions for analysis results - safe to import from client components

export type ExtractionResult = {
    party_a: string;
    party_b: string;
    contract_type: string;
    estimated_contract_months: number | null;
};

export type NegotiationMessage = {
    formal: string;
    neutral: string;
    casual: string;
};

export type EnhancedRisk = {
    clause_tag:
    | "CLAUSE_SCOPE" | "CLAUSE_PAYMENT" | "CLAUSE_ACCEPTANCE" | "CLAUSE_IP"
    | "CLAUSE_LIABILITY" | "CLAUSE_TERM" | "CLAUSE_TERMINATION" | "CLAUSE_NON_COMPETE"
    | "CLAUSE_JURISDICTION" | "CLAUSE_CONFIDENTIAL" | "CLAUSE_HARASSMENT"
    | "CLAUSE_REDELEGATE" | "CLAUSE_INVOICE" | "CLAUSE_OTHER";

    section_title: string;
    original_text: string;
    risk_level: "critical" | "high" | "medium" | "low";

    violated_laws: Array<
        | "freelance_new_law_art3" | "freelance_new_law_art4" | "freelance_new_law_art5"
        | "freelance_new_law_art12" | "freelance_new_law_art13"
        | "subcontract_act" | "civil_code_conformity" | "copyright_art27_28"
        | "disguised_employment" | "antitrust_underpayment" | "public_order"
    >;

    explanation: string;

    suggestion: {
        revised_text: string;
        negotiation_message: NegotiationMessage;
        legal_basis: string;
    };
};

export type EnhancedAnalysisResult = {
    summary: string;
    risks: EnhancedRisk[];
    contract_classification: "ukeoi" | "jun_inin_hourly" | "jun_inin_result" | "mixed" | "unknown";
    missing_clauses: string[];
};

// Backward compatibility
export type AnalysisResult = EnhancedAnalysisResult;
