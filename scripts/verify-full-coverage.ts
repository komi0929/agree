
import { runRuleBasedChecks } from '../lib/rules/rule-checker';

const RISK_ITEMS = [
    { no: 1, name: "Payment Site", text: "報酬は翌々月末払いとする。", expectedId: "payment_001" },
    { no: 2, name: "Inspection Start", text: "支払期間は検査合格日を起算日とする。", expectedId: "acceptance_001" },
    { no: 3, name: "Copyright Transfer", text: "著作権はすべて甲に譲渡する。", expectedId: "copyright_001" },
    { no: 4, name: "Liability", text: "損害賠償額の上限は設けないものとする。", expectedId: "liability_003" },
    { no: 5, name: "Termination", text: "甲は理由の如何を問わず本契約を直ちに解除できる。", expectedId: "kbp_termination_001" },
    { no: 6, name: "Scope", text: "その他甲が指示する一切の業務。", expectedId: "scope_001" },
    { no: 7, name: "Non-compete", text: "契約終了後2年間は競業を行ってはならない。", expectedId: "non_compete_001" },
    { no: 8, name: "Conformity", text: "契約不適合責任期間は納品後1年間とする。", expectedId: "conformity_001" },
    { no: 9, name: "Jurisdiction", text: "管轄裁判所は甲の本店所在地を管轄する裁判所とする。", expectedId: "jurisdiction_001" },
    { no: 10, name: "Re-entrustment", text: "再委託は禁止する。", expectedId: "employment_005" },
    { no: 11, name: "AI Learning", text: "甲は成果物をAIの学習データとして利用できる。", expectedId: "ai_usage_001" }
];

const MISSING_ITEMS = [
    { no: 12, name: "Deemed Acceptance", expectedId: "recommend_012" },
    { no: 13, name: "Delay Damages", expectedId: "recommend_013" },
    { no: 14, name: "Consumption Tax", expectedId: "recommend_014" },
    { no: 15, name: "Expenses", expectedId: "recommend_015" },
    { no: 16, name: "Start Payment", expectedId: "recommend_016" },
    { no: 17, name: "Termination Payment", expectedId: "recommend_017" },
    { no: 18, name: "Price Change", expectedId: "recommend_018" },
    { no: 19, name: "Delay Exemption", expectedId: "recommend_019" },
    { no: 20, name: "AI Tool Usage", expectedId: "recommend_020" },
    { no: 21, name: "Background IP", expectedId: "recommend_021" },
    { no: 22, name: "Portfolio", expectedId: "recommend_022" },
    { no: 23, name: "Credit", expectedId: "recommend_023" },
    { no: 24, name: "Poaching", expectedId: "recommend_024" },
    { no: 25, name: "Contact Hours", expectedId: "recommend_025" },
    { no: 26, name: "Harassment", expectedId: "recommend_026" },
    { no: 27, name: "Rush Fees", expectedId: "recommend_027" },
    { no: 28, name: "Auto Renewal", expectedId: "recommend_028" },
];

function verifyAll28() {
    console.log("🛡️ Verifying All 28 Checkpoints Coverage...");
    let passed = 0;

    // 1. Verify Risks (Items 1-11)
    for (const item of RISK_ITEMS) {
        const result = runRuleBasedChecks(item.text);
        const risks = result.risks;
        const found = risks.find(r => r.id === item.expectedId);

        if (found) {
            console.log(`✅ [${item.no}] ${item.name}: Detected`);
            passed++;
        } else {
            console.error(`❌ [${item.no}] ${item.name}: Not Detected!`);
            console.error(`   Input: "${item.text}"`);
            console.error(`   Found IDs: ${risks.map(r => r.id).join(", ")}`);
        }
    }

    // 2. Verify Missing Clauses (Items 12-28)
    // Run on empty text -> Should trigger all "missing"
    const emptyResult = runRuleBasedChecks("");
    const missingRisks = emptyResult.risks.filter(r => r.source === "recommended_clause");

    for (const item of MISSING_ITEMS) {
        const found = missingRisks.find(r => r.id === item.expectedId);

        if (found) {
            console.log(`✅ [${item.no}] ${item.name}: Detected (as Missing)`);
            passed++;
        } else {
            // Special check: Maybe logic changed?
            console.error(`❌ [${item.no}] ${item.name}: Not Detected!`);
            console.error(`   Expected ID: ${item.expectedId}`);
        }
    }

    const total = RISK_ITEMS.length + MISSING_ITEMS.length;
    console.log(`\n📊 Result: ${passed}/${total} Checkpoints Verified`);

    if (passed === total) {
        console.log("🎉 100% Coverage Confirmed!");
        process.exit(0);
    } else {
        process.exit(1);
    }
}

verifyAll28();
