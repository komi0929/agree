
import * as fs from 'fs';
import * as path from 'path';
import { runRuleBasedChecks } from '../lib/rules/rule-checker';

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

// Definition of test cases
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

// Complicated patterns (Safe but tricky context)
const trickySafePatterns = [
    "損害賠償の上限を設けないという合意はしない。上限は委託料とする。",
    "損害賠償額は委託料を上限とする。なお、契約の更新は行わない。",
    "上限はないよりあったほうがよいので、委託料相当額を上限とする。",
    "損害賠償の上限は委託料とする。次条：契約期間の定めはない。"
];

function runTests() {
    console.log("🛡️ Starting Robust Liability Regex Verification (Clone Mode)...\n");

    let passedSafe = 0;
    let passedUnsafe = 0;
    let passedTricky = 0;

    console.log("--- 🟢 Testing SAFE Patterns (Should NOT hit Critical) ---");
    safePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));

        if (!criticalRisk) {
            console.log(`✅ [Safe ${i + 1}] Passed`);
            passedSafe++;
        } else {
            console.error(`❌ [Safe ${i + 1}] FAILED! Matched: ${criticalRisk.title}`);
            console.error(`   Text: ${text}`);
        }
    });

    console.log("\n--- 🔴 Testing UNSAFE Patterns (Must HIT Critical) ---");
    unsafePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));

        if (criticalRisk) {
            console.log(`✅ [Unsafe ${i + 1}] Passed (Detected: ${criticalRisk.title})`);
            passedUnsafe++;
        } else {
            console.error(`❌ [Unsafe ${i + 1}] FAILED! Not detected.`);
            console.error(`   Text: ${text}`);
        }
    });

    console.log("\n--- 🟡 Testing TRICKY Safe Patterns (Should NOT hit Critical) ---");
    trickySafePatterns.forEach((text, i) => {
        const result = runRuleBasedChecks(text);
        const criticalRisk = result.risks.find(r => r.risk_level === 'critical' && r.title.includes('賠償'));

        if (!criticalRisk) {
            console.log(`✅ [Tricky ${i + 1}] Passed`);
            passedTricky++;
        } else {
            console.error(`❌ [Tricky ${i + 1}] FAILED! Matched: ${criticalRisk.title}`);
            console.error(`   Text: ${text}`);
        }
    });

    console.log("\n📊 Summary");
    console.log(`Safe Patterns:   ${passedSafe}/${safePatterns.length}`);
    console.log(`Unsafe Patterns: ${passedUnsafe}/${unsafePatterns.length}`);
    console.log(`Tricky Patterns: ${passedTricky}/${trickySafePatterns.length}`);

    const total = safePatterns.length + unsafePatterns.length + trickySafePatterns.length;
    const passed = passedSafe + passedUnsafe + passedTricky;

    if (passed === total) {
        console.log("\n🎉 ALL TESTS PASSED. Robustness Verification Complete.");
        process.exit(0);
    } else {
        console.error("\n💥 SOME TESTS FAILED.");
        process.exit(1);
    }
}

runTests();
