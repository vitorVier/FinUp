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

export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
export type GoalType =
    | "SAVING"
    | "INVESTMENT"
    | "PURCHASE"
    | "TRAVEL"
    | "EMERGENCY"
    | "DEBT"
    | "OTHER";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Goal {
    id: string;
    userId: string;
    name: string;
    description?: string | null;
    targetValue: number | string;
    currentValue: number | string;
    status: GoalStatus;
    type: GoalType;
    targetDate?: string | null;
    monthlyTarget: number | string;
    priority: GoalPriority;
    createdAt: string;
    updatedAt: string;
}

export interface GoalFormData {
    name: string;
    description?: string;
    targetValue: number;
    currentValue?: number;
    status?: GoalStatus;
    type: GoalType;
    targetDate?: string;
    monthlyTarget?: number;
    priority: GoalPriority;
}