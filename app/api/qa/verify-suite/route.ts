
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { runAllCheckpoints } from '@/lib/rules/checkpoints-28';

export async function GET() {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);
    const error = (msg: string) => logs.push(`ERROR: ${msg}`);

    log("🚀 Starting Comprehensive 10-Pattern Verification Suite...");

    try {
        const SUITE_DIR = path.join(process.cwd(), 'test-contracts', 'suite');
        if (!fs.existsSync(SUITE_DIR)) {
            error(`Suite dir not found: ${SUITE_DIR}`);
            return NextResponse.json({ success: false, logs });
        }

        const files = fs.readdirSync(SUITE_DIR).filter(f => f.endsWith('.txt')).sort();
        let passedCount = 0;
        let totalCount = files.length;

        // Expectation Mapping
        const expectations: Record<string, { mustHave: string[], mustClear?: string[] }> = {
            "01_payment_delay.txt": { mustHave: ["CP001"] }, // 60日ルール
            "02_prohibited_acts.txt": { mustHave: ["CP004"] }, // 禁止行為
            "03_copyright_transfer.txt": { mustHave: ["CP005"] }, // 著作権
            "04_unlimited_liability.txt": { mustHave: ["CP003"] }, // 賠償上限
            "05_scope_creep.txt": { mustHave: ["CP006"] }, // 業務範囲
            "06_non_compete.txt": { mustHave: ["CP007"] }, // 競業避止
            "07_disguised_employment.txt": { mustHave: ["CP010"] }, // 偽装請負
            "08_long_warranty.txt": { mustHave: ["CP008"] }, // 契約不適合
            "09_jurisdiction.txt": { mustHave: ["CP009"] }, // 裁判管轄
            "10_perfect_contract.txt": { mustHave: [], mustClear: ["CP001", "CP002", "CP003", "CP004", "CP005", "CP006", "CP007", "CP008", "CP009", "CP010", "CP011"] }
        };

        for (const file of files) {
            log(`\n📄 Testing: ${file}`);
            const text = fs.readFileSync(path.join(SUITE_DIR, file), 'utf-8');
            const result = runAllCheckpoints(text);

            const exp = expectations[file];
            let checkPassed = true;

            // Check Must Haves (Warnings/Criticals)
            if (exp?.mustHave) {
                for (const cpId of exp.mustHave) {
                    const item = result.items.find(i => i.id === cpId);
                    if (!item || item.status === "clear") {
                        error(`FAILED: ${file} expected issue ${cpId} but got ${item?.status || 'missing'}`);
                        checkPassed = false;
                    } else {
                        log(`  ✅ Detected ${cpId} (${item.name}): ${item.status}`);
                    }
                }
            }

            // Check Must Clears
            if (exp?.mustClear) {
                for (const cpId of exp.mustClear) {
                    const item = result.items.find(i => i.id === cpId);
                    if (item && item.status !== "clear") {
                        error(`FAILED: ${file} expected CLEAR ${cpId} but got ${item.status}`);
                        checkPassed = false;
                    } else {
                        // log(`  ✅ Cleared ${cpId}`); // Too noisy
                    }
                }

                // For perfect contract, expect 0 criticals
                if (file === "10_perfect_contract.txt") {
                    if (result.summary.critical > 0) {
                        error(`FAILED: Perfect contract has critical issues: ${result.summary.critical}`);
                        checkPassed = false;
                    } else {
                        log(`  ✅ Perfect Contract: 0 Criticals`);
                    }

                    // Check recommended clauses coverage (should verify that most are green)
                    // Although perfect contract might miss some recommended clauses if text is short,
                    // but we put everything in there.
                    const missingRecommended = result.items.filter(i => i.category === 'recommended' && i.status !== 'clear');
                    if (missingRecommended.length > 5) {
                        log(`  ⚠️ Perfect contract missed ${missingRecommended.length} recommended clauses.`);
                    } else {
                        log(`  ✅ Recommended clauses mostly covered.`);
                    }
                }
            }

            if (checkPassed) {
                passedCount++;
                log(`  ✨ Result: PASS`);
            } else {
                log(`  💀 Result: FAIL`);
            }
        }

        log(`\n🎉 Verification Summary: ${passedCount}/${totalCount} Passed`);

        return NextResponse.json({ success: passedCount === totalCount, logs });

    } catch (e: any) {
        error(`Exception: ${e.message}`);
        return NextResponse.json({ success: false, logs }, { status: 500 });
    }
}
