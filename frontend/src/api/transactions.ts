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

export interface TransactionSummary {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    totalTransactions: number;
    categoryBreakdown: {
        category: string;
        total: number;
        count: number;
        percentage: number;
    }[];
    monthlyTrend: {
        month: string;
        spending: number;
    }[];
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

interface SummaryResponse {
    success: boolean;
    summary: TransactionSummary;
}

interface ParseStatementResponse {
    success: boolean;
    count: number;
    pagesProcessed?: number;
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

export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        const response = await apiClient.get<TransactionsResponse>("/transactions");
        if (response.data && Array.isArray(response.data.transactions)) {
            return response.data.transactions;
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch transactions from API:", error);
        throw error;
    }
};

export const getTransactionSummary = async (): Promise<TransactionSummary> => {
    try {
        const response = await apiClient.get<SummaryResponse>("/transactions/summary");
        if (response.data && response.data.summary) {
            return response.data.summary;
        }
        return {
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            monthlySavings: 0,
            savingsRate: 0,
            totalTransactions: 0,
            categoryBreakdown: [],
            monthlyTrend: [],
        };
    } catch (error) {
        console.error("Failed to fetch transaction summary:", error);
        throw error;
    }
};

export const createTransaction = async (
    transaction: Omit<Transaction, "_id">
): Promise<Transaction> => {
    const response = await apiClient.post<TransactionResponse>(
        "/transactions",
        transaction
    );
    return response.data.transaction;
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
): Promise<{ count: number; fileName: string; pagesProcessed?: number; transactions: Omit<Transaction, "_id">[] }> => {
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
        pagesProcessed: response.data.pagesProcessed,
        fileName: response.data.fileName,
        transactions: response.data.transactions,
    };
};

export const importBatchTransactions = async (
    transactions: Omit<Transaction, "_id">[],
    fileName?: string
): Promise<{ count: number; message: string; transactions: Transaction[]; duplicatesSkipped: number; totalExtracted: number }> => {
    const response = await apiClient.post<ImportBatchResponse>(
        "/transactions/import",
        { transactions, fileName }
    );
    const newCount = response.data.count || response.data.data?.newTransactions || response.data.transactions?.length || 0;
    const dups = response.data.data?.duplicatesSkipped || 0;
    const total = response.data.data?.totalExtracted || transactions.length;

    return {
        count: newCount,
        message: response.data.message || `Import complete. ${newCount} new transactions added.`,
        transactions: response.data.transactions || response.data.data?.transactions || [],
        duplicatesSkipped: dups,
        totalExtracted: total,
    };
};