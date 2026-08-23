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

export const getTransactions = async (): Promise<Transaction[]> => {
    const response =
        await apiClient.get<TransactionsResponse>(
            "/transactions"
        );

    return response.data.transactions;
};

export const createTransaction = async (
    transaction: Omit<Transaction, "_id">
): Promise<Transaction> => {
    const response =
        await apiClient.post<TransactionResponse>(
            "/transactions",
            transaction
        );

    return response.data.transaction;
};