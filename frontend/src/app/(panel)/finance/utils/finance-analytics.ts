import { CategoryMonthlyExpense, MonthlyCashFlow, PlannedVsActual } from "../types/analytics";

type AnalyticsTransaction = {
    id: string;
    date: Date | string;
    value: number | string | { toString(): string };
    type: "INFLOW" | "OUTFLOW";
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    categoryId: string;
    category: {
        id: string;
        name: string;
        color?: string | null;
    };
};

const formatMonth = (date: Date) => {
    return date.toISOString().slice(0, 7);
};

const formatMonthLabel = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        year: "2-digit",
    }).format(date);
};

export function generateMonths(months: number) {
    const result: {
        key: string;
        label: string;
        date: Date;
    }[] = [];

    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        result.push({
            key: formatMonth(date),
            label: formatMonthLabel(date),
            date,
        });
    }

    return result;
}

export function buildCashFlowEvolution(
    transactions: AnalyticsTransaction[],
    months: number
): MonthlyCashFlow[] {
    const monthList = generateMonths(months);

    return monthList.map((month) => {
        const monthTransactions = transactions.filter(
            (transaction) =>
                formatMonth(
                    new Date(transaction.date)
                ) === month.key
        );

        const inflows = monthTransactions
            .filter(
                (transaction) =>
                    transaction.type === "INFLOW" &&
                    transaction.status === "CONFIRMED"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.value),
                0
            );

        const outflows = monthTransactions
            .filter(
                (transaction) =>
                    transaction.type === "OUTFLOW" &&
                    transaction.status === "CONFIRMED"
            )
            .reduce(
                (total, transaction) =>
                    total + Number(transaction.value),
                0
            );

        return {
            month: month.key,
            label: month.label,
            inflows,
            outflows,
            balance: inflows - outflows,
        };
    });
}

export function buildCategoryEvolution(
    transactions: AnalyticsTransaction[],
    months: number
): CategoryMonthlyExpense[] {
    const monthList = generateMonths(months);

    return monthList.map((month) => {
        const categories: Record<string, number> = {};

        transactions
            .filter(
                (transaction) =>
                    transaction.status === "CONFIRMED" &&
                    transaction.type === "OUTFLOW" &&
                    formatMonth(
                        new Date(transaction.date)
                    ) === month.key
            )
            .forEach((transaction) => {
                const name = transaction.category.name;

                categories[name] =
                    (categories[name] || 0) +
                    Number(transaction.value);
            });

        return {
            month: month.key,
            label: month.label,
            categories,
        };
    });
}

export function buildPlannedVsActual(
    transactions: AnalyticsTransaction[]
): PlannedVsActual[] {
    const categories = new Map<
        string,
        {
            name: string;
            planned: number;
            actual: number;
        }
    >();

    transactions
        .filter(
            (transaction) =>
                transaction.type === "OUTFLOW"
        )
        .forEach((transaction) => {
            const category =
                categories.get(
                    transaction.categoryId
                ) || {
                    name: transaction.category.name,
                    planned: 0,
                    actual: 0,
                };

            const value = Number(transaction.value);

            if (transaction.status === "PENDING") {
                category.planned += value;
            }

            if (transaction.status === "CONFIRMED") {
                category.actual += value;
            }

            categories.set(
                transaction.categoryId,
                category
            );
        });

    return Array.from(categories.entries()).map(
        ([categoryId, category]) => {
            const difference =
                category.actual -
                category.planned;

            const differencePercent =
                category.planned > 0
                    ? (difference /
                        category.planned) *
                    100
                    : 0;

            return {
                categoryId,
                categoryName: category.name,
                planned: category.planned,
                actual: category.actual,
                difference,
                differencePercent,
            };
        }
    );
}