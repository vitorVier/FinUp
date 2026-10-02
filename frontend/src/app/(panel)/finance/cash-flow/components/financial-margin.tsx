"use client";

import { Wallet } from "lucide-react";
import type { RecurringExpense, MonthlyCashFlow } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

interface FinancialMarginProps {
    recurringExpenses: RecurringExpense[];
    evolution: MonthlyCashFlow[];
}

export function FinancialMargin({
    recurringExpenses,
    evolution,
}: FinancialMarginProps) {
    const currentMonth = evolution.length > 0 ? evolution[evolution.length - 1] : null;
    const projectedInflow = currentMonth ? currentMonth.inflows : 0;
    
    const totalRecurringOutflow = recurringExpenses.reduce((acc, curr) => acc + curr.value, 0);
    
    // We assume currentMonth.outflows already includes realized expenses for the month.
    // However, some realized expenses might also be recurring ones that were already paid.
    // Since we don't have detailed recurrence linking on the frontend easily here,
    // a simplified margin = Inflows - Outflows (realized) - Recurrences (total active).
    // Or better per spec: Entradas previstas - (Recorrências OUTFLOW + saídas já realizadas).
    
    // As instructed: Cálculo: Entradas previstas do mês − (Recorrências OUTFLOW + saídas já realizadas).
    // This could theoretically double count if a recurrence is already in "saídas já realizadas",
    // but without specific "is this recurrence paid this month" flag from endpoint B,
    // we follow the spec formula precisely.
    const realizedOutflow = currentMonth ? currentMonth.outflows : 0;

    const margin = projectedInflow - (totalRecurringOutflow + realizedOutflow);

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#053032]/10 dark:bg-emerald-400/10">
                    <Wallet className="h-4 w-4 text-[#053032] dark:text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-sm font-semibold">Margem financeira</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Espaço de manobra restante no mês
                    </p>
                </div>
            </div>

            <div className="mt-5">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                    {formatBRL(margin)}
                </span>
                
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Este é o valor que ainda sobra considerando suas entradas, seus custos fixos mensais e os gastos que você já realizou neste mês.
                </p>
            </div>
        </div>
    );
}
