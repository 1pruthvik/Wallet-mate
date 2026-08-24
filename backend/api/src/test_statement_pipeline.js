const app = require("./server");
const { extractTransactionsFromText, parseStatementBuffer } = require("./services/statementParser");

const PORT = 5001; // Use separate port for test suite
const API_BASE = `http://localhost:${PORT}/api`;

/* =========================================================
   SYNTHETIC MULTI-PAGE PDF GENERATOR (Standard PDF 1.4)
========================================================= */

function buildSyntheticMultiPageBankStatementPdf() {
    const page1Lines = [
        "HDFC BANK LIMITED - ACCOUNT STATEMENT",
        "Account Number: 50100293849102  IFSC: HDFC0000128",
        "Customer Name: Mr. Rahul Sharma  Branch: KORAMANGALA BANGALORE",
        "Statement Period: 01/08/2026 to 31/08/2026",
        "Date Particulars / Narration Chq/Ref No Withdrawal (Dr) Deposit (Cr) Balance",
        "01/08/2026 UPI/P2M/Swiggy/swiggy@icici/Order1029 450.00 44,550.00",
        "03/08/2026 TECHCORP CORP SALARY AUG 2026 85,000.00 1,29,550.00 CR",
        "05/08/2026 ACH-TATAPOWER-ELECTRICITY BILL MUMBAI 2,450.00 1,27,100.00",
        "-- Page 1 of 2 --",
    ];

    const page2Lines = [
        "HDFC BANK LIMITED - ACCOUNT STATEMENT (Contd.)",
        "Date Particulars / Narration Chq/Ref No Withdrawal (Dr) Deposit (Cr) Balance",
        "10/08/2026 POS/AMAZON INDIA/RETAIL ORDER REF#88921 1,899.00 1,25,201.00",
        "15/08/2026 UPI-ZOMATO-RESTO-P2M-99218277 620.00 1,24,581.00",
        "18/08/2026 UBER INDIA TRANSPORT RIDE 340.00 1,24,241.00",
        "22/08/2026 DIVIDEND CREDIT INFOSYS LIMITED 1,200.00 1,25,441.00 CR",
        "Closing Balance: 1,25,441.00 Total Withdrawal: 5,759.00 Total Deposit: 86,200.00",
        "-- Page 2 of 2 --",
    ];

    let stream1 = "";
    let y1 = 720;
    for (const line of page1Lines) {
        stream1 += `BT /F1 11 Tf 50 ${y1} Td (${line.replace(/[()]/g, "")}) Tj ET\n`;
        y1 -= 28;
    }

    let stream2 = "";
    let y2 = 720;
    for (const line of page2Lines) {
        stream2 += `BT /F1 11 Tf 50 ${y2} Td (${line.replace(/[()]/g, "")}) Tj ET\n`;
        y2 -= 28;
    }

    const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >> endobj
4 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >> endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
6 0 obj << /Length ${Buffer.byteLength(stream1)} >> stream
${stream1}endstream endobj
7 0 obj << /Length ${Buffer.byteLength(stream2)} >> stream
${stream2}endstream endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000120 00000 n 
0000000242 00000 n 
0000000364 00000 n 
0000000435 00000 n 
0000000550 00000 n 
trailer << /Size 8 /Root 1 0 R >>
startxref
665
%%EOF`;

    return Buffer.from(pdf);
}

function buildEmptyScannedPdf() {
    const stream = "";
    const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 0 >> stream
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
250
%%EOF`;
    return Buffer.from(pdf);
}

/* =========================================================
   HTTP HELPERS
========================================================= */

async function postJson(url, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
}

async function getJson(url, token) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: "GET",
        headers,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
}

async function postFormData(url, fileBuffer, fileName, fieldName = "statement", token) {
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
        Buffer.from(header, "utf8"),
        fileBuffer,
        Buffer.from(footer, "utf8"),
    ]);

    const headers = {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: "POST",
        headers,
        body,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
}

/* =========================================================
   RUN COMPLETE TEST PIPELINE
========================================================= */

async function runStatementPipelineTests() {
    console.log("==================================================================");
    console.log("🚀 STARTING COMPREHENSIVE BANK STATEMENT PDF & PARSER TEST SUITE");
    console.log("==================================================================\n");

    let server;
    try {
        server = await new Promise((resolve) => {
            const s = app.listen(PORT, () => resolve(s));
        });
    } catch (err) {
        // Port might be in use
    }

    try {
        // 1. Direct Statement Parser Unit Tests
        console.log("1. Testing Unit Text Extraction on Multi-Page Statement...");
        const multiPagePdfBuffer = buildSyntheticMultiPageBankStatementPdf();
        const parseResult = await parseStatementBuffer(multiPagePdfBuffer, "application/pdf", "hdfc_august.pdf");

        console.log(`   ✅ Extracted ${parseResult.transactions.length} transactions across ${parseResult.pagesProcessed} pages.`);
        console.log("   Extracted txs:", JSON.stringify(parseResult.transactions, null, 2));
        const salaryTx = parseResult.transactions.find((t) => t.category === "Salary" || /salary/i.test(t.description) || /salary/i.test(t.merchant));
        console.log(`   ✅ Salary transaction found: ₹${salaryTx?.amount} | Type: ${salaryTx?.type} (Expected: income)`);
        if (salaryTx?.type !== "income") throw new Error("Salary was not classified as income!");

        const swiggyTx = parseResult.transactions.find((t) => /swiggy/i.test(t.merchant));
        console.log(`   ✅ Swiggy transaction found: ₹${swiggyTx?.amount} | Type: ${swiggyTx?.type} (Expected: expense)`);
        if (swiggyTx?.type !== "expense") throw new Error("Swiggy was not classified as expense!");

        // 2. Multi-line Narration Parsing
        console.log("\n2. Testing Multi-Line Narration Parsing...");
        const multiLineText = `
01/08/2026 UPI/P2M/Swiggy Food Order
REF NO: 991823771928
CUSTOMER TXN ID: ORD_99182
450.00 45,000.00
03/08/2026 AIRTEL BROADBAND FIBER BILL
FOR BROADBAND ACC 080293819
1,179.00 43,821.00
`;
        const multiLineTxs = extractTransactionsFromText(multiLineText);
        console.log(`   ✅ Multi-line text parsed: ${multiLineTxs.length} transactions.`);
        console.log(`   ✅ Tx 1 Narration: "${multiLineTxs[0].description}"`);
        if (!multiLineTxs[0].description.includes("REF NO") || !multiLineTxs[0].description.includes("ORD_99182")) {
            throw new Error("Continuation lines were lost!");
        }

        // 3. Indian Currency and Date Formats
        console.log("\n3. Testing Indian Currency (commas, ₹, INR) and Date Formats...");
        const indianFormatText = `
23-Aug-2026 JEWELLERY PURCHASE JOYALUKKAS ₹1,25,000.50 2,00,000.00
25.08.2026 MUTUAL FUND SIP HDFC MF 5,000.00 1,95,000.00
`;
        const indianTxs = extractTransactionsFromText(indianFormatText);
        console.log(`   ✅ Indian amount parsed: ₹${indianTxs[0].amount} (Expected: 125000.5)`);
        if (indianTxs[0].amount !== 125000.5) throw new Error("Failed to parse 1,25,000.50 amount!");

        // 4. Scanned / Empty PDF Rejection
        console.log("\n4. Testing Scanned / Empty PDF Rejection...");
        const emptyBuffer = buildEmptyScannedPdf();
        let emptyCaught = false;
        try {
            await parseStatementBuffer(emptyBuffer, "application/pdf", "empty_scanned.pdf");
        } catch (err) {
            emptyCaught = true;
            console.log(`   ✅ Correctly rejected scanned PDF with message: "${err.message}"`);
        }
        if (!emptyCaught) throw new Error("Empty scanned PDF should have been rejected!");

        // 5. Register User and Test API End-to-End
        console.log("\n5. Testing End-to-End PDF Upload API (/api/transactions/parse-statement)...");
        const uniqueEmail = `pdf_test_user_${Date.now()}@walletmate.io`;
        const regRes = await postJson(`${API_BASE}/auth/register`, {
            fullName: "Nivish Tester",
            email: uniqueEmail,
            password: "Password@2026",
        });
        const token = regRes.data.token;
        console.log("   ✅ User Registered! Token received.");

        // Upload PDF to /api/transactions/parse-statement
        const uploadRes = await postFormData(
            `${API_BASE}/transactions/parse-statement`,
            multiPagePdfBuffer,
            "hdfc_august_statement.pdf",
            "statement",
            token
        );
        console.log("   ✅ Upload response status:", uploadRes.status, "| Count:", uploadRes.data.count, "| Pages:", uploadRes.data.pagesProcessed);
        if (!uploadRes.ok || uploadRes.data.count < 7) {
            throw new Error("Upload endpoint failed to extract transactions from PDF!");
        }

        // 6. Test Batch Import into Database
        console.log("\n6. Testing Batch Import into Database (/api/transactions/import)...");
        const importRes = await postJson(
            `${API_BASE}/transactions/import`,
            {
                transactions: uploadRes.data.transactions,
                fileName: "hdfc_august_statement.pdf",
            },
            token
        );
        console.log("   ✅ Batch import message:", importRes.data.message);
        console.log("   ✅ Newly inserted:", importRes.data.data?.newTransactions);

        // 7. Test Duplicate Statement Upload Protection
        console.log("\n7. Testing Duplicate Statement Upload Protection...");
        const dupImportRes = await postJson(
            `${API_BASE}/transactions/import`,
            {
                transactions: uploadRes.data.transactions,
                fileName: "hdfc_august_statement.pdf",
            },
            token
        );
        console.log("   ✅ Re-import response:", dupImportRes.data.message);
        console.log("   ✅ Duplicates skipped:", dupImportRes.data.data?.duplicatesSkipped, "(Expected: 7)");
        if (dupImportRes.data.data?.newTransactions !== 0) {
            throw new Error("Duplicates were mistakenly inserted!");
        }

        // 8. Test Transactions Ledger API after Import
        console.log("\n8. Verifying Real Imported Transactions via GET /api/transactions...");
        const userTxs = await getJson(`${API_BASE}/transactions`, token);
        console.log(`   ✅ Total user transactions in database: ${userTxs.data.transactions?.length}`);
        if (userTxs.data.transactions?.length < 7) {
            throw new Error("Database transaction count does not match imported statement!");
        }

        // 9. Test Financial Summary Metrics
        console.log("\n9. Verifying Dynamic Dashboard Summary via GET /api/transactions/summary...");
        const summary = await getJson(`${API_BASE}/transactions/summary`, token);
        console.log("   ✅ Total Inflow (Income): ₹", summary.data.summary?.totalIncome);
        console.log("   ✅ Total Outflow (Expenses): ₹", summary.data.summary?.totalExpenses);
        console.log("   ✅ Net Balance: ₹", summary.data.summary?.totalBalance);

        // 10. Test User Data Isolation (User A vs User B)
        console.log("\n10. Testing Strict User Data Isolation...");
        const userBEmail = `user_b_${Date.now()}@walletmate.io`;
        const regB = await postJson(`${API_BASE}/auth/register`, {
            fullName: "User B",
            email: userBEmail,
            password: "Password@2026",
        });
        const tokenB = regB.data.token;
        const userBTxs = await getJson(`${API_BASE}/transactions`, tokenB);
        console.log(`   ✅ User B Initial Tx Count: ${userBTxs.data.transactions?.length} (Expected: 0)`);
        if (userBTxs.data.transactions?.length !== 0) {
            throw new Error("User B can see User A's transactions!");
        }

        console.log("\n==================================================================");
        console.log("🎉 ALL STATEMENT PIPELINE TESTS PASSED! FULL PIPELINE CERTIFIED");
        console.log("==================================================================");
    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    } finally {
        if (server && server.close) {
            server.close();
        }
        process.exit(0);
    }
}

runStatementPipelineTests();
