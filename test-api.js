// test-api.js - Test the contract rewrite API locally
const fs = require('fs');

const testContract = `業務委託契約書

第1条（目的）
甲は乙に対し、ソフトウェア開発業務を委託する。

第2条（支払）
報酬は検収完了後90日以内に支払う。

第3条（損害賠償）
乙は甲に生じた一切の損害を賠償する。

第4条（著作権）
成果物の著作権は全て甲に移転する。

第5条（競業避止）
乙は契約終了後5年間、競合他社と取引してはならない。`;

async function testAPI() {
    console.log("=== Testing /api/generate-corrected ===");

    try {
        const response = await fetch("http://localhost:3000/api/generate-corrected", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contractText: testContract, userRole: "vendor" })
        });

        console.log("Response status:", response.status);

        const data = await response.json();

        if (data.error) {
            console.log("ERROR:", data.error);
            return;
        }

        // Save output to file for inspection
        fs.writeFileSync("output-contract.txt", data.correctedFullText || "EMPTY", "utf8");
        console.log("Output saved to: output-contract.txt");
        console.log("Length:", data.correctedFullText?.length || 0, "chars");

        // Check for forbidden patterns
        const forbidden = ["追加してください", "【追加条項", "ご確認ください"];
        for (const pattern of forbidden) {
            if (data.correctedFullText?.includes(pattern)) {
                console.log("WARNING: Contains forbidden pattern:", pattern);
            }
        }

        console.log("DONE");
    } catch (error) {
        console.error("Request failed:", error);
    }
}

testAPI();
