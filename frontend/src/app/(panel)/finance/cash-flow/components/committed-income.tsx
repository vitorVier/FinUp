"use client";

import { PieChartIcon } from "lucide-react";
import type { RecurringExpense, MonthlyCashFlow } from "../../types/analytics";

interface CommittedIncomeProps {
    recurringExpenses: RecurringExpense[];
    evolution: MonthlyCashFlow[];
}

export function CommittedIncome({
    recurringExpenses,
    evolution,
}: CommittedIncomeProps) {
    // Current month is the last one in evolution array
    const currentMonth = evolution.length > 0 ? evolution[evolution.length - 1] : null;
    const projectedInflow = currentMonth ? currentMonth.inflows : 0;

    const totalRecurringOutflow = recurringExpenses.reduce((acc, curr) => acc + curr.value, 0);

    const committedPct = projectedInflow > 0 
        ? (totalRecurringOutflow / projectedInflow) * 100 
        : 0;

    const isHigh = committedPct > 50;
    const isCritical = committedPct > 70;

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#053032]/10 dark:bg-emerald-400/10">
                    <PieChartIcon className="h-4 w-4 text-[#053032] dark:text-emerald-400" />
                </div>

                <div>
                    <h2 className="text-sm font-semibold">Renda comprometida</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Sua renda já tomada por custos fixos
                    </p>
                </div>
            </div>

            <div className="mt-5">
                <div className="flex items-end justify-between">
                    <span 
                        className={`text-3xl font-bold tracking-tight ${
                            isCritical 
                                ? "text-red-600" 
                                : isHigh 
                                    ? "text-amber-600" 
                                    : "text-emerald-600"
                        }`}
                    >
                        {committedPct.toFixed(1)}%
                    </span>
                </div>
                
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={`h-full rounded-full transition-all ${
                            isCritical 
                                ? "bg-red-500" 
                                : isHigh 
                                    ? "bg-amber-500" 
                                    : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(committedPct, 100)}%` }}
                    />
                </div>
                
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {isCritical ? (
                        "Atenção: Grande parte da sua renda mensal já está comprometida com gastos fixos antes mesmo do mês começar."
                    ) : isHigh ? (
                        "Cuidado: Mais da metade da sua renda já está comprometida com custos fixos."
                    ) : (
                        "Saudável: Seus custos fixos estão em um nível confortável em relação à sua renda."
                    )}
                </p>
            </div>
        </div>
    );
}
