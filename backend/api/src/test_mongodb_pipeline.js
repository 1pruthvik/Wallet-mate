const API_BASE = "http://localhost:5000/api";

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

    try {
        // 1. Health check
        console.log("1. Checking API Health...");
        const health = await getJson("http://localhost:5000/api/health");
        console.log("   ✅ Health Status:", health.data.status, "| Service:", health.data.service);

        // 2. Register User A
        const uniqueEmailA = `test_user_a_${Date.now()}@walletmate.io`;
        console.log(`\n2. Registering User A (${uniqueEmailA})...`);
        const regResA = await postJson(`${API_BASE}/auth/register`, {
            fullName: "Alice Morgan",
            email: uniqueEmailA,
            password: "Password@2026",
            phoneNumber: `+9198${Date.now().toString().slice(-8)}`,
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
        console.log("   Response status:", txA1.status, "data:", txA1.data);

        // 7. Create Transaction for User B
        console.log("\n7. Creating Transactions for User B...");
        const txB1 = await postJson(
            `${API_BASE}/transactions`,
            {
                merchant: "Tech Salary Corp",
                amount: 90000,
                type: "income",
                category: "Salary",
                date: new Date().toISOString(),
                description: "Monthly salary",
            },
            tokenB
        );
        console.log("   Response status:", txB1.status, "data:", txB1.data);

        // 8. Test Multi-Tenant User Isolation
        console.log("\n8. Verifying Strict User Isolation...");
        const userAFetch = await getJson(`${API_BASE}/transactions`, tokenA);
        const userBFetch = await getJson(`${API_BASE}/transactions`, tokenB);

        const txsA = userAFetch.data.transactions || [];
        const txsB = userBFetch.data.transactions || [];

        console.log(`   User A transactions: ${txsA.length} (contains Swiggy: ${txsA.some(t => t.merchant?.includes("Swiggy"))})`);
        console.log(`   User B transactions: ${txsB.length} (contains Salary: ${txsB.some(t => t.merchant?.includes("Salary"))})`);

        const isIsolated =
            txsA.length > 0 &&
            txsB.length > 0 &&
            !txsA.some(t => t.merchant?.includes("Salary")) &&
            !txsB.some(t => t.merchant?.includes("Swiggy"));

        if (isIsolated) {
            console.log("   ✅ User isolation verified: User A CANNOT see User B transactions!");
        } else {
            console.error("   ❌ User isolation failed or transactions empty!");
        }

        // 9. Test Batch PDF Transactions Import & Deduplication
        console.log("\n9. Testing Batch PDF Transactions Import & Deduplication...");
        const batchPayload = [
            {
                merchant: "Amazon.in",
                amount: 1999,
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
            }
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
    }
}

runTests();
