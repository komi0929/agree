
import * as fs from 'fs';
import * as path from 'path';
import { runRuleBasedChecks } from '../lib/rules/rule-checker';
import { analyzeContractText } from '../lib/ai-service';
import { mergeAnalysisResults } from '../lib/legal/result-merger';

// Manual .env loading
const loadEnv = () => {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
};

loadEnv();

const SUITE_DIR = path.join(process.cwd(), 'test-contracts', 'suite');

interface TestCase {
    filename: string;
    expectedCondition: (result: any, text: string) => boolean;
    description: string;
}

const testCases: TestCase[] = [
    {
        filename: "01_payment_delay.txt",
        description: "Must detect 60-day rule violation",
        expectedCondition: (result) => {
            // Check for payment rule violation
            return result.risks.some((r: any) =>
                (r.source === 'payment_rule' || r.violated_laws.includes('freelance_new_law_art4')) &&
                (r.risk_level === 'critical' || r.risk_level === 'high')
            );
        }
    },
    {
        filename: "02_prohibited_acts.txt",
        description: "Must detect prohibited acts (reduction/return)",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.violated_laws.includes('freelance_new_law_art5') ||
                r.explanation.includes('減額') ||
                r.explanation.includes('返品')
            );
        }
    },
    {
        filename: "03_copyright_transfer.txt",
        description: "Must detect Copyright transfer without Art 27/28",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.violated_laws.includes('copyright_art27_28') ||
                r.section_title.includes('権利の帰属') ||
                r.explanation.includes('著作権')
            );
        }
    },
    {
        filename: "04_unlimited_liability.txt",
        description: "Must detect Unlimited Liability",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.risk_level === 'critical' &&
                (r.section_title.includes('損害賠償') || r.explanation.includes('賠償'))
            );
        }
    },
    {
        filename: "05_scope_creep.txt",
        description: "Must detect Ambiguous Scope",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.clause_tag === 'CLAUSE_SCOPE' ||
                r.explanation.includes('業務内容') ||
                r.explanation.includes('不明確')
            );
        }
    },
    {
        filename: "06_non_compete.txt",
        description: "Must detect Excessive Non-compete",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.clause_tag === 'CLAUSE_NON_COMPETE' ||
                r.explanation.includes('競業')
            );
        }
    },
    {
        filename: "07_disguised_employment.txt",
        description: "Must detect Disguised Employment indicators",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.violated_laws.includes('disguised_employment') ||
                r.explanation.includes('指揮命令') ||
                r.explanation.includes('偽装請負')
            );
        }
    },
    {
        filename: "08_long_warranty.txt",
        description: "Must detect Long Warranty/Defect Liability",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.explanation.includes('契約不適合') ||
                r.explanation.includes('瑕疵') ||
                r.section_title.includes('責任')
            );
        }
    },
    {
        filename: "09_jurisdiction.txt",
        description: "Must detect Unfair Jurisdiction",
        expectedCondition: (result) => {
            return result.risks.some((r: any) =>
                r.clause_tag === 'CLAUSE_JURISDICTION' ||
                r.explanation.includes('管轄')
            );
        }
    },
    {
        filename: "10_perfect_contract.txt",
        description: "Must NOT have Critical risks (Healthy contract)",
        expectedCondition: (result) => {
            const criticals = result.risks.filter((r: any) => r.risk_level === 'critical');
            return criticals.length === 0;
        }
    }
];

async function runSuite() {
    console.log("🚀 Starting 10-Pattern Contract Verification Suite...");

    if (!process.env.OPENAI_API_KEY) {
        console.warn("⚠️  OPENAI_API_KEY not found. Some AI-only checks might fail or use fallbacks.");
    }

    let passedCount = 0;
    const results: { file: string, pass: boolean, note: string }[] = [];

    for (const testCase of testCases) {
        const filePath = path.join(SUITE_DIR, testCase.filename);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${testCase.filename}`);
            results.push({ file: testCase.filename, pass: false, note: "File missing" });
            continue;
        }

        const text = fs.readFileSync(filePath, 'utf-8');

        // Run Analysis
        const ruleResult = runRuleBasedChecks(text);
        const aiResult = await analyzeContractText(text); // Might be mocked/fallback if no key, but logic handles it
        const mergedResult = mergeAnalysisResults(ruleResult, aiResult);

        // Check Condition
        const pass = testCase.expectedCondition(mergedResult, text);

        if (pass) {
            console.log(`✅ [PASS] ${testCase.filename}: ${testCase.description}`);
            passedCount++;
        } else {
            console.error(`❌ [FAIL] ${testCase.filename}: ${testCase.description}`);
            // detailed debug
            console.log("   Risks found:", mergedResult.risks.map(r => `${r.risk_level}: ${r.section_title}`).join(', '));
        }

        results.push({
            file: testCase.filename,
            pass,
            note: pass ? "OK" : "Condition failed"
        });
    }

    console.log("\n📊 Summary:");
    console.table(results);
    console.log(`\nResult: ${passedCount}/${testCases.length} Passed`);

    return passedCount === testCases.length;
}

// Robustness Test Patterns
const safePatterns = [
    "損害賠償額は、本契約の委託料相当額を上限とする。",
    "損害賠償額は、過去1年間に甲が乙に支払った報酬総額を上限とします。",
    "いかなる場合も、損害賠償の責任は発注金額を超えないものとする。",
    "乙の故意または重過失を除き、賠償額は委託料の100%を上限とする。",
    "損害賠償額は、金100万円を上限として責任を負う。",
    "本条に基づく賠償額は、個別契約に定める金額を上限とします。",
    "損害賠償の上限は、本業務の委託料相当額とします。ただし、故意重過失を除く。",
    "損害賠償額は、直近3ヶ月分の報酬額を上限とする。",
    "乙が負う損害賠償責任は、本件委託料の範囲内に限定される。",
    "甲は、乙に対して委託料を超えて損害賠償を請求することはできない。"
];

const unsafePatterns = [
    "乙は、甲に生じた一切の損害を賠償しなければならない。",
    "損害賠償額の上限は設けないものとする。",
    "損害賠償責任については、何ら制限を設けない。",
    "乙は、本契約の履行に関し甲に損害を与えた場合、その損害を全額賠償する。",
    "賠償額の上限は定めない。",
    "損害賠償の上限なし。",
    "乙は、金額の多寡にかかわらず、甲のすべての損害を賠償する義務を負う。",
    "損害賠償の上限に関する規定は適用しない。",
    "一切の損害（間接損害及び逸失利益を含む）を賠償するものとする。",
    "なお、本条の損害賠償責任に上限はないものとする。"
];

const trickySafePatterns = [
    "損害賠償の上限を設けないという合意はしない。上限は委託料とする。",
    "損害賠償額は委託料を上限とする。なお、契約の更新は行わない。",
    "上限はないよりあったほうがよいので、委託料相当額を上限とする。",
    "損害賠償の上限は委託料とする。次条：契約期間の定めはない。"
];

function verifyRobustness() {
    console.log("\n🛡️ Starting Robust Liability Regex Verification...");
    let passedSafe = 0;
    let passedUnsafe = 0;
    let passedTricky = 0;

    // SAFE
    safePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));
        if (!criticalRisk) passedSafe++;
        else console.error(`   ❌ [Safe ${i + 1}] Failed: ${text}`);
    });

    // UNSAFE
    unsafePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));
        if (criticalRisk) passedUnsafe++;
        else console.error(`   ❌ [Unsafe ${i + 1}] Failed: ${text}`);
    });

    // TRICKY
    trickySafePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));
        if (!criticalRisk) passedTricky++;
        else console.error(`   ❌ [Tricky ${i + 1}] Failed: ${text}`);
    });

    console.log(`   Safe: ${passedSafe}/${safePatterns.length}, Unsafe: ${passedUnsafe}/${unsafePatterns.length}, Tricky: ${passedTricky}/${trickySafePatterns.length}`);
    return (passedSafe === safePatterns.length && passedUnsafe === unsafePatterns.length && passedTricky === trickySafePatterns.length);
}

runSuite().then(async (suitePassed) => {
    const robustnessPassed = verifyRobustness();

    if (suitePassed && robustnessPassed) {
        console.log("\n🎉 ALL CHECKS PASSED (Contract Suite + Robustness)");
        process.exit(0);
    } else {
        console.error("\n💥 SOME CHECKS FAILED");
        process.exit(1);
    }
}).catch(e => {
    console.error(e);
    process.exit(1);
});
