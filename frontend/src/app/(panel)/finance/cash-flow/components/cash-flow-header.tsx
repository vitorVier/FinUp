"use client";

import { BarChart3 } from "lucide-react";

export function CashFlowHeader() {
    return (
        <header className="flex flex-col gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#053032]/10">
                        <BarChart3 className="h-4 w-4 text-[#053032]" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#053032]">
                        Financeiro
                    </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Fluxo de caixa
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Acompanhe suas entradas, saídas e saldo ao longo dos meses.
                </p>
            </div>
        </header>
    );
}
