"use client";

import { RefreshCw } from "lucide-react";

import type { RecurringExpense } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

interface RecurringExpensesListProps {
    data: RecurringExpense[];
}

export function RecurringExpensesList({
    data,
}: RecurringExpensesListProps) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#053032]/10 dark:bg-emerald-400/10">
                        <RefreshCw className="h-4 w-4 text-[#053032] dark:text-emerald-400" />
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold">
                            Despesas recorrentes
                        </h2>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Saídas fixas ativas
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {data.length === 0 ? (
                    <div className="flex min-h-[120px] items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground">
                            Nenhuma recorrência de saída ativa.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {data.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium">
                                        {item.name}
                                    </p>

                                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span>
                                            Dia {item.dayOfMonth}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {item.categoryName}
                                        </span>
                                    </div>
                                </div>

                                <span className="shrink-0 text-xs font-semibold">
                                    {formatBRL(item.value)}
                                </span>
                            </div>
                        ))}

                        <div className="mt-3 border-t border-border/60 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Total recorrente
                                </span>
                                <span className="text-sm font-bold">
                                    {formatBRL(
                                        data.reduce(
                                            (sum, r) =>
                                                sum + r.value,
                                            0
                                        )
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
