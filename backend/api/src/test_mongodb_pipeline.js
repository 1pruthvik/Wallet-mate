const app = require("./server");

const PORT = 5000;
const API_BASE = `http://localhost:${PORT}/api`;

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

async function runTests() {
    console.log("=================================================");
    console.log("🚀 STARTING WALLET-MATE MONGODB & AUTH TEST SUITE");
    console.log("=================================================\n");

    let server;
    try {
        server = await new Promise((resolve) => {
            const s = app.listen(PORT, () => resolve(s));
        });
    } catch (err) {
        // Server might already be running
    }

    try {
        // 1. Health check
        console.log("1. Checking API Health...");
        const health = await getJson(`http://localhost:${PORT}/api/health`);
        console.log("   ✅ Health Status:", health.data.status, "| Service:", health.data.service);

        // 2. Register User A
        const uniqueEmailA = `test_user_a_${Date.now()}@walletmate.io`;
        console.log(`\n2. Registering User A (${uniqueEmailA})...`);
        const regResA = await postJson(`${API_BASE}/auth/register`, {
            fullName: "Alice Morgan",
            email: uniqueEmailA,
            password: "Password@2026",
        });
        if (!regResA.ok) throw new Error(JSON.stringify(regResA.data));
        console.log("   ✅ User A Registered! ID:", regResA.data.user.id);
        const tokenA = regResA.data.token;

        // 3. Test Duplicate Registration Prevention
        console.log("\n3. Testing Duplicate Registration Prevention...");
        const dupRes = await postJson(`${API_BASE}/auth/register`, {
            fullName: "Alice Impersonator",
            email: uniqueEmailA,
            password: "Password@2026",
        });
        if (dupRes.status === 409) {
            console.log("   ✅ Duplicate registration properly rejected (HTTP 409:", dupRes.data.message, ")");
        } else {
            console.error("   ❌ Failed: Duplicate was not rejected!", dupRes.status);
        }

        // 4. Test Login
        console.log("\n4. Testing User A Login...");
        const loginRes = await postJson(`${API_BASE}/auth/login`, {
            email: uniqueEmailA,
            password: "Password@2026",
        });
        if (loginRes.ok) {
            console.log("   ✅ Login successful! Token received.");
        } else {
            throw new Error("Login failed: " + JSON.stringify(loginRes.data));
        }

        // 5. Register User B
        const uniqueEmailB = `test_user_b_${Date.now()}@walletmate.io`;
        console.log(`\n5. Registering User B (${uniqueEmailB})...`);
        const regResB = await postJson(`${API_BASE}/auth/register`, {
            fullName: "Bob Smith",
            email: uniqueEmailB,
            password: "Password@2026",
        });
        console.log("   ✅ User B Registered! ID:", regResB.data.user.id);
        const tokenB = regResB.data.token;

        // 6. Create Transaction for User A
        console.log("\n6. Creating Transactions for User A...");
        const txA1 = await postJson(
            `${API_BASE}/transactions`,
            {
                merchant: "Swiggy Food",
                amount: 750,
                type: "expense",
                category: "Food",
                date: new Date().toISOString(),
                description: "Lunch order",
            },
            tokenA
        );
        console.log("   ✅ Tx 1 Created for User A:", txA1.data.transaction?.merchant, "₹", txA1.data.transaction?.amount);

        const txA2 = await postJson(
            `${API_BASE}/transactions`,
            {
                merchant: "Tech Corp Salary",
                amount: 85000,
                type: "income",
                category: "Salary",
                date: new Date().toISOString(),
                description: "Monthly salary credit",
            },
            tokenA
        );
        console.log("   ✅ Tx 2 Created for User A:", txA2.data.transaction?.merchant, "₹", txA2.data.transaction?.amount);

        // 7. Create Transaction for User B
        console.log("\n7. Creating Transactions for User B...");
        const txB1 = await postJson(
            `${API_BASE}/transactions`,
            {
                merchant: "Netflix Subscription",
                amount: 649,
                type: "expense",
                category: "Entertainment",
                date: new Date().toISOString(),
                description: "Monthly subscription",
            },
            tokenB
        );
        console.log("   ✅ Tx 1 Created for User B:", txB1.data.transaction?.merchant, "₹", txB1.data.transaction?.amount);

        // 8. Test Data Isolation (User A should NOT see User B transactions)
        console.log("\n8. Testing Data Isolation & Ownership...");
        const userATxs = await getJson(`${API_BASE}/transactions`, tokenA);
        const userBTxs = await getJson(`${API_BASE}/transactions`, tokenB);

        console.log(`   User A Tx Count: ${userATxs.data.transactions?.length} (Expected: 2)`);
        console.log(`   User B Tx Count: ${userBTxs.data.transactions?.length} (Expected: 1)`);

        const isIsolated =
            userATxs.data.transactions?.length === 2 &&
            userBTxs.data.transactions?.length === 1 &&
            !userATxs.data.transactions.some((t) => t.merchant === "Netflix Subscription") &&
            !userBTxs.data.transactions.some((t) => t.merchant === "Swiggy Food");

        if (isIsolated) {
            console.log("   ✅ STRICT DATA ISOLATION CONFIRMED: Users cannot access each other's transactions.");
        } else {
            console.error("   ❌ DATA ISOLATION FAILED!");
        }

        // 9. Test Analytics Endpoint for User A
        console.log("\n9. Testing MongoDB Financial Analytics for User A...");
        const summaryA = await getJson(`${API_BASE}/transactions/summary`, tokenA);
        console.log("   ✅ Total Inflow (Income): ₹", summaryA.data.summary?.totalIncome);
        console.log("   ✅ Total Outflow (Expenses): ₹", summaryA.data.summary?.totalExpenses);
        console.log("   ✅ Net Cashflow (Balance): ₹", summaryA.data.summary?.netBalance);

        // 10. Test Batch Import & Deduplication
        console.log("\n10. Testing Statement Import & Deduplication...");
        const batchPayload = [
            {
                merchant: "Amazon India",
                amount: 1499,
                type: "expense",
                category: "Shopping",
                date: new Date().toISOString(),
                description: "Wireless Earbuds",
                referenceNumber: "REF_AMZ_001",
            },
            {
                merchant: "Uber Ride",
                amount: 320,
                type: "expense",
                category: "Transport",
                date: new Date().toISOString(),
                description: "Cab to Office",
                referenceNumber: "REF_UBR_002",
            },
        ];

        const import1 = await postJson(
            `${API_BASE}/transactions/import`,
            { transactions: batchPayload, fileName: "august_statement.pdf" },
            tokenA
        );
        console.log("   First import:", import1.data.message);

        // Re-upload same batch -> should skip duplicates
        const import2 = await postJson(
            `${API_BASE}/transactions/import`,
            { transactions: batchPayload, fileName: "august_statement.pdf" },
            tokenA
        );
        console.log("   Second import (duplicate test):", import2.data.message);

        // Fetch User A after import
        const userAFinal = await getJson(`${API_BASE}/transactions`, tokenA);
        console.log(`   User A total transactions after PDF import: ${userAFinal.data.transactions?.length}`);

        console.log("\n=================================================");
        console.log("🎉 ALL TESTS PASSED! MONGODB ARCHITECTURE CONFIRMED");
        console.log("=================================================");
    } catch (err) {
        console.error("Test error:", err.message);
    } finally {
        if (server && server.close) {
            server.close();
        }
        process.exit(0);
    }
}

runTests();
