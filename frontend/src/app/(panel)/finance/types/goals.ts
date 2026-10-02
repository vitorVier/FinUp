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