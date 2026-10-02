export interface MonthlyCashFlow {
    month: string;
    label: string;
    inflows: number;
    outflows: number;
    balance: number;
}

export interface CategoryMonthlyExpense {
    month: string;
    label: string;
    categories: Record<string, number>;
}

export interface PlannedVsActual {
    categoryId: string;
    categoryName: string;
    planned: number;
    actual: number;
    difference: number;
    differencePercent: number;
}

export interface RecurringExpense {
    id: string;
    name: string;
    value: number;
    dayOfMonth: number;
    categoryName: string;
    categoryColor?: string | null;
}

export interface CashFlowAnalytics {
    evolution: MonthlyCashFlow[];
    categoryEvolution: CategoryMonthlyExpense[];
    plannedVsActual: PlannedVsActual[];
    recurringExpenses: RecurringExpense[];
}