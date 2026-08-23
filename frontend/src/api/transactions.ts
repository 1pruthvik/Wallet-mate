import apiClient from "./client";

export interface Transaction {
    _id?: string;
    id?: string;
    userId?: string;
    source?: {
        type?: "pdf" | "manual" | "csv" | "api";
        fileName?: string;
    };
    merchant: string;
    amount: number;
    type: "income" | "expense" | "transfer" | "refund";
    category: string;
    date: string;
    transactionDate?: string;
    description?: string;
    paymentMethod?: string;
    accountNumberMasked?: string;
    referenceNumber?: string;
    balanceAfterTransaction?: number | null;
    transactionHash?: string;
    status?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface TransactionsResponse {
    success: boolean;
    count?: number;
    transactions: Transaction[];
}

interface TransactionResponse {
    success: boolean;
    transaction: Transaction;
    message?: string;
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
    count?: number;
    message: string;
    data?: {
        fileName: string;
        totalExtracted: number;
        newTransactions: number;
        duplicatesSkipped: number;
        transactions: Transaction[];
    };
    transactions: Transaction[];
}

const FALLBACK_TRANSACTIONS: Transaction[] = [
    {
        _id: "660000000000000000001001",
        merchant: "Tech Corp (Salary)",
        amount: 85000,
        type: "income",
        category: "Salary",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        description: "Monthly salary credit",
        paymentMethod: "Bank Transfer",
    },
    {
        _id: "660000000000000000001002",
        merchant: "Swiggy",
        amount: 640,
        type: "expense",
        category: "Food",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        description: "Dinner order",
        paymentMethod: "UPI",
    },
    {
        _id: "660000000000000000001003",
        merchant: "Amazon.in",
        amount: 2499,
        type: "expense",
        category: "Shopping",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        description: "Electronics & Accessories",
        paymentMethod: "Card",
    },
    {
        _id: "660000000000000000001004",
        merchant: "Cult.fit",
        amount: 1499,
        type: "expense",
        category: "Health",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        description: "Monthly Fitness pass",
        paymentMethod: "UPI",
    },
    {
        _id: "660000000000000000001005",
        merchant: "Mutual Fund SIP",
        amount: 10000,
        type: "expense",
        category: "Investment",
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        description: "Nifty 50 Index Fund SIP",
        paymentMethod: "ACH / Auto-Debit",
    },
    {
        _id: "660000000000000000001006",
        merchant: "Shell Fuel Station",
        amount: 2100,
        type: "expense",
        category: "Transport",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        description: "Petrol refill",
        paymentMethod: "Card",
    },
    {
        _id: "660000000000000000001007",
        merchant: "Freelance Client UI Project",
        amount: 24500,
        type: "income",
        category: "Freelance",
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        description: "Design consultation payout",
        paymentMethod: "Bank Transfer",
    },
    {
        _id: "660000000000000000001008",
        merchant: "Netflix",
        amount: 499,
        type: "expense",
        category: "Entertainment",
        date: new Date(Date.now() - 12 * 86400000).toISOString(),
        description: "Monthly Subscription",
        paymentMethod: "UPI",
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

export const updateTransaction = async (
    id: string,
    updates: Partial<Transaction>
): Promise<Transaction> => {
    const response = await apiClient.put<TransactionResponse>(
        `/transactions/${id}`,
        updates
    );
    return response.data.transaction;
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<{ success: boolean }>(
        `/transactions/${id}`
    );
    return response.data.success;
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
    transactions: Omit<Transaction, "_id">[],
    fileName?: string
): Promise<{ count: number; message: string; transactions: Transaction[] }> => {
    try {
        const response = await apiClient.post<ImportBatchResponse>(
            "/transactions/import",
            { transactions, fileName }
        );
        return {
            count: response.data.count || response.data.data?.newTransactions || response.data.transactions?.length || 0,
            message: response.data.message || "Import completed successfully.",
            transactions: response.data.transactions || response.data.data?.transactions || [],
        };
    } catch (error: any) {
        console.warn("Backend import offline fallback:", error.message);
        const imported: Transaction[] = transactions.map((t, idx) => ({
            ...t,
            _id: `tx_imported_${Date.now()}_${idx}`,
            createdAt: new Date().toISOString(),
        }));
        return {
            count: imported.length,
            message: `Imported ${imported.length} transactions locally.`,
            transactions: imported,
        };
    }
};