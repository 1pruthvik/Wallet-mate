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

export const getTransactions = async (): Promise<Transaction[]> => {
    const response = await apiClient.get<TransactionsResponse>("/transactions");
    return response.data.transactions;
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
    const response = await apiClient.post<ImportBatchResponse>(
        "/transactions/import",
        { transactions }
    );

    return response.data.transactions;
};