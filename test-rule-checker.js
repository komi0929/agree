// test-rule-checker.js
// 直接ルールベースチェッカーをテストするスクリプト

const testContract = `業務委託契約書

株式会社サンプルコーポレーション（以下「甲」という）と、田中太郎（以下「乙」という）とは、甲が乙に対し業務を委託するにあたり、以下の通り契約（以下「本契約」という）を締結する。

第1条（目的）
甲は乙に対し、別紙仕様書記載のソフトウェア開発及びこれに関連する業務（以下「本業務」という）を委託し、乙はこれを受託する。

第2条（再委託）
乙は、本業務の全部または一部を第三者に再委託してはならない。ただし、甲が書面により事前に承諾した場合はこの限りではない。

第3条（成果物の検収）
1. 乙は、本業務の成果物を甲の指定する期日までに納入するものとする。
2. 甲は、成果物の納入後、その内容の検査を行う。甲が検査に合格した旨を記載した書面（検収書）を乙に交付した日をもって検収完了とする。
3. 甲による検査期間に制限は設けないものとし、甲が明示的に検収書を交付しない限り、成果物は検収されたものとはみなされない。

第4条（委託料及び支払条件）
1. 甲は乙に対し、本業務の対価として、別途定める委託料を委託料は、乙が成果物を納品した日から60日以内に支払うものとする。

第5条（権利の帰属）
本業務の遂行過程で生じた成果物（プログラム、設計書、ドキュメント等を含むがこれらに限られない）に関する著作権（著作権法第27条及び第28条の権利を含む）、特許権、その他の知的財産権は、その発生と同時に乙から甲に移転するものとする。なお、乙は、成果物に含まれる乙が従前から保有していたノウハウやツール等についても、甲への移転対象とする。

第6条（契約不適合責任）
1. 成果物に不適合が発見された場合、乙は、検収完了の前後を問わず、また期間の定めなく、自らの費用と責任においてこれを修補し、または甲に生じた損害を賠償しなければならない。
2. 前項の責任は、当該不適合が甲の指示に起因する場合であっても免責されないものとする。

第7条（損害賠償）
乙は、本契約に違反した場合、甲に生じた一切の損害を賠償する義務を負う。

第8条（解除）
1. 甲は、乙に何らの契約違反がない場合であっても、１週間前に予告することにより、本契約の全部または一部を解除することができる。
2. 前項に基づき契約が解除された場合、乙は、既に受領済みの委託料があるときは、これを直ちに甲に返還しなければならない。また、乙は甲に対し、解除により生じた損害の賠償を請求することはできない。

第9条（競業避止）
乙は、本契約終了後5年間は、甲の事前の書面による承諾なく、甲と競合する事業を行う企業からの業務受託、就職、または自ら競合事業を行うことを禁止する。`;

async function testRuleChecker() {
    console.log("=== ルールベースチェッカーテスト ===\n");

    try {
        // Dynamic import of the rule checker
        const { runRuleBasedChecks } = await import("./lib/rules/rule-checker.ts");

        console.log("契約書のテスト...\n");
        const result = runRuleBasedChecks(testContract);

        console.log(`検出されたリスク数: ${result.risks.length}`);
        console.log(`Critical: ${result.stats.critical_count}`);
        console.log(`High: ${result.stats.high_count}`);
        console.log(`Medium: ${result.stats.medium_count}`);
        console.log(`Low: ${result.stats.low_count}`);
        console.log("\n--- リスク一覧 ---\n");

        for (const risk of result.risks) {
            console.log(`[${risk.risk_level.toUpperCase()}] ${risk.title}`);
            console.log(`  Source: ${risk.source}`);
            console.log(`  Explanation: ${risk.explanation.substring(0, 100)}...`);
            if (risk.suggested_fix) {
                console.log(`  Fix: ${risk.suggested_fix.substring(0, 80)}...`);
            }
            console.log("");
        }

        console.log("\n--- 欠落条項 ---\n");
        for (const clause of result.missing_clauses) {
            console.log(`- ${clause.missing_title}`);
        }

        console.log("\n--- 推奨欠落条項 ---\n");
        for (const clause of result.missing_recommended) {
            console.log(`- ${clause.missing_title}`);
        }

    } catch (error) {
        console.error("テスト失敗:", error);
    }
}

testRuleChecker();
