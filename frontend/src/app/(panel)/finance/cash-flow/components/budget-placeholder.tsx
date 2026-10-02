"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

export function BudgetPlaceholder() {
    return (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold tracking-tight">
                            Categorias que mais estouram o orçamento
                        </h2>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                            Acompanhe onde os limites de gastos são
                            ultrapassados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex min-h-[180px] items-center justify-center px-5 py-8">
                <div className="max-w-sm text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>

                    <p className="mt-3 text-sm font-semibold">
                        Defina seus orçamentos
                    </p>

                    <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-muted-foreground">
                        Configure limites de gastos por categoria para
                        acompanhar quais despesas estão ultrapassando o
                        planejado.
                    </p>

                    <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#053032] transition-colors hover:text-[#0c4441] dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                        Configurar orçamentos
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}