import apiClient from "./client";

export interface Transaction {
    _id?: string;
    merchant: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface TransactionsResponse {
    success: boolean;
    transactions: Transaction[];
}

interface TransactionResponse {
    success: boolean;
    transaction: Transaction;
}

interface ParseStatementResponse {
    success: boolean;
    count: number;
    fileName: string;
    transactions: Omit<Transaction, "_id">[];
    message?: string;
}

interface ImportBatchResponse {
    success: boolean;
    count: number;
    message: string;
    transactions: Transaction[];
}

const FALLBACK_TRANSACTIONS: Transaction[] = [
    {
        _id: "tx_fb_01",
        merchant: "Tech Corp (Salary)",
        amount: 85000,
        type: "income",
        category: "Salary",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        description: "Monthly salary credit",
    },
    {
        _id: "tx_fb_02",
        merchant: "Swiggy",
        amount: 640,
        type: "expense",
        category: "Food",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        description: "Dinner order",
    },
    {
        _id: "tx_fb_03",
        merchant: "Amazon.in",
        amount: 2499,
        type: "expense",
        category: "Shopping",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        description: "Electronics & Accessories",
    },
    {
        _id: "tx_fb_04",
        merchant: "Cult.fit",
        amount: 1499,
        type: "expense",
        category: "Health",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        description: "Monthly Fitness pass",
    },
    {
        _id: "tx_fb_05",
        merchant: "Mutual Fund SIP",
        amount: 10000,
        type: "expense",
        category: "Investment",
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        description: "Nifty 50 Index Fund SIP",
    },
    {
        _id: "tx_fb_06",
        merchant: "Shell Fuel Station",
        amount: 2100,
        type: "expense",
        category: "Transport",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        description: "Petrol refill",
    },
    {
        _id: "tx_fb_07",
        merchant: "Freelance Project",
        amount: 24500,
        type: "income",
        category: "Freelance",
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        description: "Design consultation payout",
    },
    {
        _id: "tx_fb_08",
        merchant: "Netflix",
        amount: 499,
        type: "expense",
        category: "Entertainment",
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        description: "Monthly Subscription",
    }
];

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        const response = await apiClient.get<TransactionsResponse>("/transactions");
        if (response.data && Array.isArray(response.data.transactions)) {
            return response.data.transactions;
        }
        return FALLBACK_TRANSACTIONS;
    } catch (error) {
        console.warn("API server offline or unreachable, using local fallback transactions:", error);
        return FALLBACK_TRANSACTIONS;
    }
};

export const createTransaction = async (
    transaction: Omit<Transaction, "_id">
): Promise<Transaction> => {
    try {
        const response = await apiClient.post<TransactionResponse>(
            "/transactions",
            transaction
        );
        return response.data.transaction;
    } catch (error) {
        const localTx: Transaction = {
            ...transaction,
            _id: `tx_local_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        FALLBACK_TRANSACTIONS.unshift(localTx);
        return localTx;
    }
};

export const parseBankStatement = async (
    file: File
): Promise<{ count: number; fileName: string; transactions: Omit<Transaction, "_id">[] }> => {
    const formData = new FormData();
    formData.append("statement", file);

    const response = await apiClient.post<ParseStatementResponse>(
        "/transactions/parse-statement",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return {
        count: response.data.count,
        fileName: response.data.fileName,
        transactions: response.data.transactions,
    };
};

export const importBatchTransactions = async (
    transactions: Omit<Transaction, "_id">[]
): Promise<Transaction[]> => {
    try {
        const response = await apiClient.post<ImportBatchResponse>(
            "/transactions/import",
            { transactions }
        );
        return response.data.transactions;
    } catch (error) {
        const imported: Transaction[] = transactions.map((t, idx) => ({
            ...t,
            _id: `tx_imported_${Date.now()}_${idx}`,
            createdAt: new Date().toISOString(),
        }));
        return imported;
    }
};