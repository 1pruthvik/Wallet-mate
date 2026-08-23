const pdfParse = require("pdf-parse");

/* =========================================================
   MERCHANT & CATEGORY RULES (Indian Banking Context)
========================================================= */

const MERCHANT_PATTERNS = [
    { regex: /swiggy/i, name: "Swiggy", category: "Food" },
    { regex: /zomato/i, name: "Zomato", category: "Food" },
    { regex: /mcdonald/i, name: "McDonald's", category: "Food" },
    { regex: /starbucks/i, name: "Starbucks", category: "Food" },
    { regex: /domino/i, name: "Domino's Pizza", category: "Food" },
    { regex: /blinkit|zepto|instamart|bigbasket/i, name: "Groceries", category: "Food" },

    { regex: /amazon|amzn/i, name: "Amazon", category: "Shopping" },
    { regex: /flipkart/i, name: "Flipkart", category: "Shopping" },
    { regex: /myntra/i, name: "Myntra", category: "Shopping" },
    { regex: /nykaa/i, name: "Nykaa", category: "Shopping" },
    { regex: /zara|h&m|uniqlo/i, name: "Clothing", category: "Shopping" },
    { regex: /apple\.com|croma|reliance digital/i, name: "Electronics", category: "Shopping" },

    { regex: /uber/i, name: "Uber", category: "Transport" },
    { regex: /ola\s*cabs|olacabs/i, name: "Ola", category: "Transport" },
    { regex: /rapido/i, name: "Rapido", category: "Transport" },
    { regex: /irctc|indian rail/i, name: "IRCTC", category: "Transport" },
    { regex: /fuel|petrol|hpcl|bpcl|ioc|shell/i, name: "Fuel & Transport", category: "Transport" },

    { regex: /airtel/i, name: "Airtel", category: "Bills" },
    { regex: /jio/i, name: "Jio", category: "Bills" },
    { regex: /electricity|bescom|tata power|bses/i, name: "Electricity Bill", category: "Bills" },
    { regex: /broadband|act fibernet|wifi/i, name: "Internet Bill", category: "Bills" },
    { regex: /rent|maintenance/i, name: "House Rent", category: "Bills" },

    { regex: /netflix/i, name: "Netflix", category: "Entertainment" },
    { regex: /spotify/i, name: "Spotify", category: "Entertainment" },
    { regex: /hotstar|prime video|youtube/i, name: "Streaming", category: "Entertainment" },
    { regex: /pvr|inox|bookmyshow/i, name: "Movies & Events", category: "Entertainment" },

    { regex: /salary|payroll|corp salary|direct dep/i, name: "Salary", category: "Income", isIncome: true },
    { regex: /dividend|interest cr|refund|cashback/i, name: "Refund / Interest", category: "Income", isIncome: true },

    { regex: /atm\s*w/i, name: "ATM Cash Withdrawal", category: "Other" },
];

/* =========================================================
   CLEAN NARRATION & EXTRACT MERCHANT
========================================================= */

const identifyMerchantAndCategory = (narration, isCredit = false) => {
    const text = narration.trim();

    for (const item of MERCHANT_PATTERNS) {
        if (item.regex.test(text)) {
            return {
                merchant: item.name,
                category: item.category,
                type: item.isIncome || isCredit ? "income" : "expense",
            };
        }
    }

    // UPI cleaner: UPI-SWIGGY-12345 or UPI/P2M/Swiggy/...
    const upiMatch = text.match(/UPI[-/](?:P2M|P2A|REV)?[-/]?([A-Za-z0-9\s._]+?)(?:[-/]|@|\d{6,}|$)/i);
    let cleanMerchant = upiMatch && upiMatch[1] ? upiMatch[1].trim() : text.slice(0, 30).trim();

    // Remove noise prefixes like "POS ", "ECOM ", "NEFT-", "IMPS-"
    cleanMerchant = cleanMerchant
        .replace(/^(?:POS|ECOM|NEFT|IMPS|RTGS|UPI|ACH|NACH|INB|BIL)[-\s/]+/i, "")
        .replace(/[-_/].*$/, "")
        .replace(/[,\t;]+/g, "")
        .trim();

    if (!cleanMerchant || cleanMerchant.length < 2) {
        cleanMerchant = isCredit ? "Credit Deposit" : "Bank Transfer";
    } else {
        cleanMerchant = cleanMerchant
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }

    return {
        merchant: cleanMerchant,
        category: isCredit ? "Income" : "Other",
        type: isCredit ? "income" : "expense",
    };
};

/* =========================================================
   PARSE DATE
========================================================= */

const parseBankDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString();

    const clean = dateStr.trim();

    // Standard DD/MM/YYYY or DD-MM-YYYY or DD-MM-YY
    const ddmmyyyy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (ddmmyyyy) {
        let day = parseInt(ddmmyyyy[1], 10);
        let month = parseInt(ddmmyyyy[2], 10) - 1;
        let year = parseInt(ddmmyyyy[3], 10);
        if (year < 100) year += 2000;
        const d = new Date(Date.UTC(year, month, day));
        if (!isNaN(d.getTime())) return d.toISOString();
    }

    // DD-Mon-YYYY e.g., 23-Aug-2026 or 23 Aug 2026
    const monthNames = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const ddmon = clean.match(/^(\d{1,2})[-/\s]([A-Za-z]{3})[-/\s](\d{2,4})$/);
    if (ddmon) {
        let day = parseInt(ddmon[1], 10);
        let mStr = ddmon[2].toLowerCase();
        let month = monthNames[mStr] !== undefined ? monthNames[mStr] : 0;
        let year = parseInt(ddmon[3], 10);
        if (year < 100) year += 2000;
        const d = new Date(Date.UTC(year, month, day));
        if (!isNaN(d.getTime())) return d.toISOString();
    }

    const fallback = new Date(clean);
    return isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
};

/* =========================================================
   EXTRACT TRANSACTIONS FROM TEXT / CSV / PDF
========================================================= */

const extractTransactionsFromText = (rawText) => {
    const lines = rawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const transactions = [];

    const dateRegex = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}[-/\s][A-Za-z]{3}[-/\s]\d{2,4})\b/;
    const amountRegex = /\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\b/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip non-transaction header rows
        if (
            /page\s+\d+|statement\s+of\s+account|opening\s+balance|closing\s+balance|transaction\s+date|value\s+date|narration.*balance/i.test(line) &&
            !dateRegex.test(line)
        ) {
            continue;
        }

        // CSV parsing when line has 3+ comma-separated tokens
        if (line.includes(",") && line.split(",").length >= 3) {
            const parts = line.split(",").map((p) => p.trim());
            const dateMatch = parts[0].match(dateRegex);

            if (dateMatch) {
                const dateStr = dateMatch[1];
                const narration = parts[1] || "Transaction";

                // Check withdrawal (debit) vs deposit (credit) columns
                let debit = 0;
                let credit = 0;

                for (let c = 2; c < parts.length; c++) {
                    const val = parseFloat(parts[c].replace(/,/g, ""));
                    if (!isNaN(val) && val > 0) {
                        if (c === 2 && parts.length >= 4 && parts[3] !== "") {
                            // Column 2 is debit if column 3 exists or vice versa
                            debit = val;
                        } else if (c === 3 || /credit|deposit|cr/i.test(parts[c])) {
                            credit = val;
                        } else if (debit === 0) {
                            debit = val;
                        }
                    }
                }

                // If only 1 amount found, determine direction by keywords or column index
                let amount = debit > 0 ? debit : credit;
                let isCredit = credit > 0 || /salary|credit|deposit|refund/i.test(narration);

                if (amount > 0) {
                    const { merchant, category, type } = identifyMerchantAndCategory(narration, isCredit);
                    transactions.push({
                        merchant,
                        category,
                        amount,
                        type,
                        date: parseBankDate(dateStr),
                        description: narration.slice(0, 120),
                    });
                    continue;
                }
            }
        }

        // Standard space/tab separated parsing for PDF and unstructured statements
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const dateStr = dateMatch[1];
        const remainingText = line.replace(dateStr, "").trim();

        const amounts = remainingText.match(amountRegex);
        if (!amounts || amounts.length === 0) continue;

        const validAmounts = amounts
            .map((a) => parseFloat(a.replace(/,/g, "")))
            .filter((num) => num > 0 && num < 100000000);

        if (validAmounts.length === 0) continue;

        let amount = validAmounts[0];
        let isCredit = /credit|cr\b|deposit|\+[\d.]+|salary/i.test(line) && !/debit|dr\b|withdrawal/i.test(line);

        let narration = remainingText;
        amounts.forEach((a) => {
            narration = narration.replace(a, "");
        });
        narration = narration
            .replace(/\b(?:dr|cr|inr|rs\.?)\b/gi, "")
            .replace(/[|;,\t]+/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();

        if (narration.length < 2) {
            narration = isCredit ? "Bank Deposit" : "Miscellaneous Expense";
        }

        const { merchant, category, type } = identifyMerchantAndCategory(narration, isCredit);

        transactions.push({
            merchant,
            category,
            amount,
            type,
            date: parseBankDate(dateStr),
            description: narration.slice(0, 120),
        });
    }

    return transactions;
};

/* =========================================================
   PARSE STATEMENT BUFFER (PDF or Text)
========================================================= */

const parseStatementBuffer = async (buffer, mimetype, originalname = "") => {
    let rawText = "";

    const isPdf =
        mimetype === "application/pdf" ||
        originalname.toLowerCase().endsWith(".pdf") ||
        buffer.slice(0, 4).toString() === "%PDF";

    if (isPdf) {
        try {
            const parsed = await pdfParse(buffer);
            rawText = parsed.text;
        } catch (err) {
            console.error("PDF Parse error:", err.message);
            throw new Error("Failed to parse PDF contents. Please ensure the file is not password-protected or corrupted.");
        }
    } else {
        rawText = buffer.toString("utf8");
    }

    if (!rawText || rawText.trim().length === 0) {
        throw new Error("No readable text found in the uploaded statement.");
    }

    return extractTransactionsFromText(rawText);
};

module.exports = {
    parseStatementBuffer,
    extractTransactionsFromText,
};
