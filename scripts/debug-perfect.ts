
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
const FILENAME = "10_perfect_contract.txt";

async function debugPerfect() {
    console.log(`🔍 Debugging ${FILENAME}...`);

    const filePath = path.join(SUITE_DIR, FILENAME);
    const text = fs.readFileSync(filePath, 'utf-8');

    // Run Analysis
    const ruleResult = runRuleBasedChecks(text);
    const aiResult = await analyzeContractText(text);
    const mergedResult = mergeAnalysisResults(ruleResult, aiResult);

    console.log("Risks found:");
    mergedResult.risks.forEach(r => {
        console.log(`- [${r.risk_level}] ${r.section_title} (${r.source})`);
        console.log(`  Explanation: ${r.explanation}`);
        console.log(`  Violated Laws: ${r.violated_laws.join(', ')}`);
    });

    const criticals = mergedResult.risks.filter(r => r.risk_level === 'critical');
    if (criticals.length === 0) {
        console.log("✅ PASS: No critical risks found.");
    } else {
        console.log("❌ FAIL: Critical risks found.");
    }
}

debugPerfect().catch(console.error);
