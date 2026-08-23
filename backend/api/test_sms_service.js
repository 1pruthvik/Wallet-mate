const { normalizePhoneNumber, maskPhoneNumber } = require("./src/services/smsService");

function runSmsServiceTests() {
    console.log("--- Testing SMS Service Phone Normalization ---");

    const tests = [
        { input: "9876543210", country: "+91", expected: "+919876543210" },
        { input: "+919876543210", country: "+91", expected: "+919876543210" },
        { input: "919876543210", country: "+91", expected: "+919876543210" },
        { input: "+14155552671", country: "+1", expected: "+14155552671" },
        { input: "4155552671", country: "+1", expected: "+14155552671" },
    ];

    let passed = 0;
    for (const t of tests) {
        const result = normalizePhoneNumber(t.input, t.country);
        if (result === t.expected) {
            console.log(`✓ Passed: ${t.input} -> ${result}`);
            passed++;
        } else {
            console.error(`✗ Failed: ${t.input} -> got ${result}, expected ${t.expected}`);
        }
    }

    console.log("\n--- Testing Phone Masking ---");
    const masked = maskPhoneNumber("+919876543210");
    console.log(`Masked +919876543210: "${masked}"`);
    if (masked.includes("*") && masked.endsWith("3210")) {
        console.log("✓ Masking passed!");
        passed++;
    }

    console.log(`\nTotal Tests Passed: ${passed}/${tests.length + 1}`);
}

runSmsServiceTests();
