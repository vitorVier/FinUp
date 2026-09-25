import { EyeOff, Search, Wallet } from "lucide-react";

interface MyFundsEmptyProps {
    type: "empty" | "search";
    wallet?: boolean;
}

export function MyFundsEmpty({
    type,
    wallet = true,
}: MyFundsEmptyProps) {
    if (type === "search") {
        return (
            <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
                <div>
                    <Search className="mx-auto h-5 w-5 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                        Nenhum fundo encontrado
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Tente buscar por outro ticker ou segmento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                {wallet ? (
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                )}
            </div>

            <h3 className="mt-4 text-sm font-semibold">
                {wallet
                    ? "Nenhum fundo salvo"
                    : "Sua Watchlist está vazia"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {wallet
                    ? "Adicione fundos à sua carteira usando a estrela no ranking."
                    : "Adicione fundos à Watchlist usando o ícone de olho no ranking."}
            </p>
        </div>
    );
}