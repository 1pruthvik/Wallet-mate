const MERCHANT_PATTERNS = [
    // Income & Credits
    { regex: /salary|payroll|ach\/salary|corp\s*salary|direct\s*dep|monthly\s*stipend/i, name: "Salary Credit", category: "Salary", isIncome: true },
    { regex: /dividend|interest\s*cr|int\.pd|savings\s*interest/i, name: "Interest / Dividend", category: "Investment", isIncome: true },
    { regex: /refund|cashback|cash\s*back|reversal|chargeback/i, name: "Refund / Cashback", category: "Income", isIncome: true },
    { regex: /freelance|consulting|client\s*pay|upwork|fiverr/i, name: "Freelance Income", category: "Freelance", isIncome: true },

    // Food & Dining
    { regex: /swiggy/i, name: "Swiggy", category: "Food" },
    { regex: /zomato/i, name: "Zomato", category: "Food" },
    { regex: /mcdonald/i, name: "McDonald's", category: "Food" },
    { regex: /starbucks/i, name: "Starbucks", category: "Food" },
    { regex: /domino|pizza\s*hut/i, name: "Domino's Pizza", category: "Food" },
    { regex: /burger\s*king/i, name: "Burger King", category: "Food" },
    { regex: /blinkit|zepto|instamart|bigbasket|dunzo/i, name: "Groceries", category: "Food" },
    { regex: /supermarket|grocery|more\s*retail|dmart|reliance\s*fresh/i, name: "Grocery Store", category: "Food" },

    // Shopping & E-Commerce
    { regex: /amazon|amzn/i, name: "Amazon", category: "Shopping" },
    { regex: /flipkart/i, name: "Flipkart", category: "Shopping" },
    { regex: /myntra/i, name: "Myntra", category: "Shopping" },
    { regex: /nykaa/i, name: "Nykaa", category: "Shopping" },
    { regex: /ajio/i, name: "Ajio", category: "Shopping" },
    { regex: /meesho/i, name: "Meesho", category: "Shopping" },
    { regex: /zara|h&m|uniqlo|lifestyle|westside/i, name: "Apparel & Fashion", category: "Shopping" },
    { regex: /apple\.com|croma|reliance\s*digital|vijay\s*sales/i, name: "Electronics", category: "Shopping" },

    // Transport & Fuel
    { regex: /uber/i, name: "Uber", category: "Transport" },
    { regex: /ola\s*cabs|olacabs/i, name: "Ola", category: "Transport" },
    { regex: /rapido/i, name: "Rapido", category: "Transport" },
    { regex: /irctc|indian\s*rail/i, name: "IRCTC Train Ticket", category: "Transport" },
    { regex: /makemytrip|goibibo|easemytrip|yatra/i, name: "Travel Booking", category: "Transport" },
    { regex: /indigo|air\s*india|spicejet|akasa/i, name: "Flight Booking", category: "Transport" },
    { regex: /fuel|petrol|hpcl|bpcl|ioc|ioccl|shell|auto\s*gas/i, name: "Fuel & Gas", category: "Transport" },
    { regex: /fastag|toll|nhai|iocl/i, name: "FASTag / Toll", category: "Transport" },

    // Bills & Utilities
    { regex: /airtel/i, name: "Airtel", category: "Bills" },
    { regex: /jio/i, name: "Jio", category: "Bills" },
    { regex: /vodafone|vi\s*bill/i, name: "Vi Telecom", category: "Bills" },
    { regex: /electricity|bescom|tata\s*power|bses|cesc|tneb|mseb/i, name: "Electricity Bill", category: "Bills" },
    { regex: /broadband|act\s*fibernet|airtel\s*broadband|wifi|hathway/i, name: "Internet Bill", category: "Bills" },
    { regex: /rent|maintenance|society|housing/i, name: "House Rent & Maintenance", category: "Bills" },
    { regex: /gas\s*bill|indane|bharat\s*gas|hp\s*gas|igl|mgl/i, name: "Gas Utility", category: "Bills" },
    { regex: /insurance|lic|hdfc\s*life|icici\s*pru|max\s*life|star\s*health/i, name: "Insurance Premium", category: "Bills" },

    // Entertainment
    { regex: /netflix/i, name: "Netflix", category: "Entertainment" },
    { regex: /spotify/i, name: "Spotify", category: "Entertainment" },
    { regex: /hotstar|disney/i, name: "Disney+ Hotstar", category: "Entertainment" },
    { regex: /prime\s*video|amazon\s*prime/i, name: "Amazon Prime", category: "Entertainment" },
    { regex: /youtube/i, name: "YouTube Premium", category: "Entertainment" },
    { regex: /pvr|inox|bookmyshow|cinepolis/i, name: "Movies & Events", category: "Entertainment" },
    { regex: /apple\s*services|itunes|google\s*play/i, name: "Digital Subscriptions", category: "Entertainment" },

    // Investment & Banking
    { regex: /zerodha|groww|upstox|angel\s*one|kuvera|indmoney/i, name: "Stock / Mutual Fund Investment", category: "Investment" },
    { regex: /sip\s*payment|mf\s*purchase|uti\s*mf|sbi\s*mf|hdfc\s*mf/i, name: "Mutual Fund SIP", category: "Investment" },
    { regex: /atw|atm\s*w|atm\s*cash|cash\s*w\/d|cash-saket/i, name: "ATM Cash Withdrawal", category: "Other" },
];

const identifyMerchantAndCategory = (narration, isCredit = false) => {
    const text = (narration || "").trim();

    for (const item of MERCHANT_PATTERNS) {
        if (item.regex.test(text)) {
            return {
                merchant: item.name,
                category: item.category,
                type: item.isIncome || isCredit ? "income" : "expense",
            };
        }
    }

    // UPI cleaner: UPI-SWIGGY-12345 or UPI/P2M/Swiggy/... or UPI/merchant@bank
    const upiMatch = text.match(/UPI[-/](?:P2M|P2A|REV|PAY)?[-/]?([A-Za-z0-9\s._]+?)(?:[-/]|@|\d{6,}|$)/i);
    let cleanMerchant = upiMatch && upiMatch[1] ? upiMatch[1].trim() : text.slice(0, 40).trim();

    // Remove noise prefixes like "POS ", "ECOM ", "NEFT-", "IMPS-", "ACH-", "NACH-", "ATW-", "ATM-"
    cleanMerchant = cleanMerchant
        .replace(/^(?:POS|ECOM|NEFT|IMPS|RTGS|UPI|ACH|NACH|INB|BIL|TPT|CHQ|CLG|ATW|ATM)[-\s/:]+/i, "")
        .replace(/[-_](?:SBI|HDFC|ICICI|AXIS|KOTAK|PNB|BOB|PAY|RETAIL)$/i, "")
        .replace(/[,\t;]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

    if (!cleanMerchant || cleanMerchant.length < 2 || /^\d+$/.test(cleanMerchant) || /^[-\s]+$/.test(cleanMerchant)) {
        cleanMerchant = isCredit ? "Direct Credit / Deposit" : "Bank Transfer / Payment";
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

const parseAmountString = (amountStr) => {
    if (!amountStr) return 0;
    const clean = amountStr.replace(/[₹$€\s]|INR|Rs\.?/gi, "").replace(/,/g, "").trim();
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : Math.abs(val);
};

const parseBankDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    const clean = dateStr.trim();

    // Standard DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const ddmmyyyy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (ddmmyyyy) {
        let day = parseInt(ddmmyyyy[1], 10);
        let month = parseInt(ddmmyyyy[2], 10) - 1;
        let year = parseInt(ddmmyyyy[3], 10);
        if (year < 100) year += 2000;
        if (year < 2000 && year >= 200) year = 2026;
        const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
        if (!isNaN(d.getTime())) return d.toISOString();
    }

    // DD-Mon-YYYY e.g., 03-Aug-2026
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
        if (year < 2000 && year >= 200) year = 2026;
        const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
        if (!isNaN(d.getTime())) return d.toISOString();
    }

    return new Date().toISOString();
};

const isNoiseLine = (line) => {
    const l = line.toLowerCase().trim();
    return (
        l.includes("page ") ||
        l.includes("-- ") ||
        l.includes("statement period") ||
        l.includes("statement of account") ||
        l.includes("account statement") ||
        l.includes("b/f / opening balance") ||
        l.includes("opening balance") ||
        l.includes("closing balance") ||
        l.includes("total withdrawals") ||
        l.includes("total deposits") ||
        l.includes("txn date") ||
        l.includes("value date") ||
        l.includes("description / narration") ||
        /^\d+[\s\d]*$/.test(l) // pure orphan digits like '6 6'
    );
};

function extractTransactionsFromText(rawText) {
    if (!rawText) return [];

    // Pre-clean wrapped dates
    let text = rawText
        .replace(/(\d{1,2}[-/\s][A-Za-z]{3}[-/\s]202)\s*[\r\n]+\s*(\d)\b/g, "$1$2")
        .replace(/(\d{1,2}[-/.]\d{1,2}[-/.]202)\s*[\r\n]+\s*(\d)\b/g, "$1$2")
        .replace(/(\d{1,2}[-/\s][A-Za-z]{3}[-/\s])202\b/g, "$12026")
        .replace(/(\d{1,2}[-/.]\d{1,2}[-/.]\s*)202\b/g, "$12026");

    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const transactions = [];
    const dateStartRegex = /^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}[-/\s][A-Za-z]{3}[-/\s]\d{2,4})/;

    let currentTx = null;

    const finalizeCurrentTx = () => {
        if (currentTx && currentTx.amount > 0) {
            const { merchant, category, type } = identifyMerchantAndCategory(
                currentTx.narration,
                currentTx.isCredit
            );

            transactions.push({
                merchant,
                category,
                amount: currentTx.amount,
                type: currentTx.explicitType || type,
                date: parseBankDate(currentTx.dateStr),
                description: currentTx.narration.replace(/\s{2,}/g, " ").slice(0, 200).trim(),
                referenceNumber: currentTx.referenceNumber || "",
                balanceAfterTransaction: currentTx.balance || null,
            });
        }
        currentTx = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (isNoiseLine(line)) {
            continue;
        }

        const dateMatch = line.match(dateStartRegex);

        if (dateMatch) {
            finalizeCurrentTx();

            const dateStr = dateMatch[1];
            let remainingText = line.substring(dateMatch[0].length).trim();

            // Strip redundant Value Date if present at the start of remainingText
            const valueDateMatch = remainingText.match(dateStartRegex);
            if (valueDateMatch) {
                remainingText = remainingText.substring(valueDateMatch[0].length).trim();
            }

            // Check for table column patterns:
            // 1. Dash in Debit position -> "- <credit_amount> <balance>" (e.g. "- 60,000.00 1,05,230.00")
            // 2. Dash in Credit position -> "<debit_amount> - <balance>" (e.g. "840.00 - 1,04,390.00")
            let amount = 0;
            let balance = null;
            let explicitType = null;
            let isCredit = false;

            const creditPattern = remainingText.match(/-\s+([₹$€\s]*\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2}))\s+([₹$€\s]*\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2}))\s*$/);
            const debitPattern = remainingText.match(/([₹$€\s]*\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2}))\s+-\s+([₹$€\s]*\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2}))\s*$/);

            if (creditPattern) {
                amount = parseAmountString(creditPattern[1]);
                balance = parseAmountString(creditPattern[2]);
                isCredit = true;
                explicitType = "income";
                remainingText = remainingText.slice(0, creditPattern.index).trim();
            } else if (debitPattern) {
                amount = parseAmountString(debitPattern[1]);
                balance = parseAmountString(debitPattern[2]);
                isCredit = false;
                explicitType = "expense";
                remainingText = remainingText.slice(0, debitPattern.index).trim();
            } else {
                // Fallback amount matching
                const amountRegex = /(?:₹|INR|Rs\.?\s*)?\b\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})\b|(?:₹|INR|Rs\.?\s*)?\b\d{1,3}(?:,\d{2,3})+\b/g;
                const rawAmounts = remainingText.match(amountRegex) || [];
                const validAmounts = rawAmounts
                    .map((a) => ({ raw: a, value: parseAmountString(a) }))
                    .filter((item) => {
                        if (item.value <= 0 || item.value > 100000000) return false;
                        if (/^\d{4}$/.test(item.raw.trim()) && item.value >= 1990 && item.value <= 2099) return false;
                        return true;
                    });

                if (validAmounts.length >= 2) {
                    amount = validAmounts[0].value;
                    balance = validAmounts[validAmounts.length - 1].value;
                } else if (validAmounts.length === 1) {
                    amount = validAmounts[0].value;
                }

                if (/(\bcr\b|\bcredit\b|\bdeposit\b|\bsalary\b)/i.test(line)) {
                    isCredit = true;
                    explicitType = "income";
                } else if (/(\bdr\b|\bdebit\b|\bwithdrawal\b)/i.test(line)) {
                    isCredit = false;
                    explicitType = "expense";
                }

                validAmounts.forEach((v) => {
                    remainingText = remainingText.replace(v.raw, "");
                });
            }

            // Extract Reference Number (e.g. TXN98324792, CHQ012934, 6219834729, N150263489, I200293847)
            const refMatch = remainingText.match(/\b(?:TXN|CHQ|REF|UTR|IMPS|NEFT)?[A-Za-z0-9]{8,22}\b/i) ||
                             remainingText.match(/\b(?:CHQ|REF|TXN)[-:\s#]*([A-Za-z0-9]{5,20})\b/i);
            const referenceNumber = refMatch ? (refMatch[1] || refMatch[0]) : "";

            let cleanNarration = remainingText
                .replace(referenceNumber, "")
                .replace(/[-+]\s*[$€₹£]\s*[$€₹£]?/g, " ")
                .replace(/[$€₹£]/g, " ")
                .replace(/\b(?:dr|cr|inr|rs\.?)\b/gi, "")
                .replace(/[-_\s]+$/, "")
                .replace(/\s{2,}/g, " ")
                .trim();

            currentTx = {
                dateStr,
                amount,
                isCredit,
                explicitType,
                narration: cleanNarration || (isCredit ? "Deposit Credit" : "Bank Transfer"),
                referenceNumber,
                balance,
            };
        }
    }

    finalizeCurrentTx();
    return transactions;
}

const sbiWrappedText = `
Opening Balance Total Deposits (Cr) Total Withdrawals (Dr) Closing Balance
45,230.00 62,500.00 18,340.00 89,390.00
Txn Date Value Date Description / Narration Ref / Cheque No. Debit (Dr) Credit (Cr) Balance
01-Aug-202 01-Aug-202 B/F / Opening Balance - - - 45,230.00
6 6
03-Aug-202 03-Aug-202 ACH/SALARY/TCS_LTD TXN98324792 - 60,000.00 1,05,230.00
6 6
05-Aug-202 05-Aug-202 UPI-ZOMATO-PAY-UPI@OKSBI 6219834729 840.00 - 1,04,390.00
6 6
10-Aug-202 10-Aug-202 ATW-CASH-SAKET-DELHI CHQ012934 10,000.00 - 94,390.00
6 6
15-Aug-202 15-Aug-202 NEFT-AMAZON RETAIL-SBI N150263489 7,500.00 - 86,890.00
6 6
20-Aug-202 20-Aug-202 IMPS-MOHIT SHARMA-SBI I200293847 - 2,500.00 89,390.00
6 6
`;

console.log("Extracted Transactions:");
console.log(JSON.stringify(extractTransactionsFromText(sbiWrappedText), null, 2));
