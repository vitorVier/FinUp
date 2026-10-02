export type TransactionType = "INFLOW" | "OUTFLOW";

export type TransactionStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED";

export interface TransactionCategory {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: TransactionType;
    isActive?: boolean;
}

export interface Transaction {
    id: string;
    categoryId: string;
    value: number | string;
    description?: string | null;
    date: string;
    paidAt?: string | null;
    status: TransactionStatus;
    type: TransactionType;
    category: TransactionCategory;
    recurringId?: string | null;
}