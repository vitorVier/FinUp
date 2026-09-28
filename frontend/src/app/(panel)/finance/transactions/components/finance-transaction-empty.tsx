import {
    FileText,
    Plus,
    SearchX,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface Props {
    hasFilters: boolean;
    onCreate: () => void;
}

export function FinanceTransactionsEmpty({
    hasFilters,
    onCreate,
}: Props) {
    return (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${hasFilters
                        ? "bg-muted"
                        : "bg-[#053032]/10"
                    }`}
            >
                {hasFilters ? (
                    <SearchX className="h-6 w-6 text-muted-foreground" />
                ) : (
                    <FileText className="h-6 w-6 text-[#053032]" />
                )}
            </div>

            <h3 className="mt-5 text-base font-semibold">
                {hasFilters
                    ? "Nenhum lançamento encontrado"
                    : "Comece pelo seu primeiro lançamento"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {hasFilters
                    ? "Nenhum lançamento corresponde aos filtros selecionados. Tente ajustar sua busca."
                    : "Registre suas entradas e saídas para começar a acompanhar sua evolução financeira."}
            </p>

            {hasFilters ? (
                <p className="mt-4 text-xs text-muted-foreground">
                    Você também pode limpar os filtros e tentar novamente.
                </p>
            ) : (
                <Button
                    onClick={onCreate}
                    className="mt-6 h-10 gap-2 rounded-lg bg-[#053032] px-4 hover:bg-[#0c4441]"
                >
                    <Plus className="h-4 w-4" />
                    Novo lançamento
                </Button>
            )}
        </div>
    );
}