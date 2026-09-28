"use client";

import { Plus, ReceiptText } from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface FinanceTransactionsHeaderProps {
    onCreate: () => void;
}

export function FinanceTransactionsHeader({
    onCreate,
}: FinanceTransactionsHeaderProps) {
    return (
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-[#053032] dark:text-emerald-400">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#053032]/10">
                        <ReceiptText className="h-4 w-4" />
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                        Financeiro
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Lançamentos
                </h1>

                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                    Registre, acompanhe e organize suas entradas e saídas
                    financeiras.
                </p>
            </div>

            <Button
                onClick={onCreate}
                className="h-10 shrink-0 gap-2 rounded-lg bg-[#053032] px-4 font-medium shadow-sm transition-all hover:bg-[#0c4441] hover:shadow-md"
            >
                <Plus className="h-4 w-4" />
                Novo lançamento
            </Button>
        </header>
    );
}