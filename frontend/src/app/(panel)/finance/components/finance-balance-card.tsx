import {
    ArrowDown,
    ArrowUp,
    WalletCards,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import { formatCurrency } from "../utils";

interface FinanceBalanceCardProps {
    realized: number;
    projected: number;
}

export function FinanceBalanceCard({
    realized,
    projected,
}: FinanceBalanceCardProps) {
    const realizedPositive = realized >= 0;
    const projectedPositive = projected >= 0;

    return (
        <Card className="relative overflow-hidden border-[#053032]/15 bg-gradient-to-br from-[#053032] to-[#073d3a] text-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04]" />

            <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-sm font-medium text-white/75">
                        Saldo do mês
                    </CardTitle>

                    <p className="mt-1 text-xs text-white/50">
                        Resultado entre entradas e saídas
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <WalletCards className="h-5 w-5 text-white" />
                </div>
            </CardHeader>

            <CardContent className="relative">
                <p
                    className={`text-3xl font-bold tracking-tight ${realizedPositive
                            ? "text-white"
                            : "text-red-300"
                        }`}
                >
                    {formatCurrency(realized)}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                    {realizedPositive ? (
                        <ArrowUp className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-red-300" />
                    )}

                    <span>Saldo realizado</span>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/50">
                                Saldo projetado
                            </p>

                            <p
                                className={`mt-1 text-lg font-semibold ${projectedPositive
                                        ? "text-emerald-300"
                                        : "text-red-300"
                                    }`}
                            >
                                {formatCurrency(projected)}
                            </p>
                        </div>

                        <div
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${projectedPositive
                                    ? "bg-emerald-400/10 text-emerald-300"
                                    : "bg-red-400/10 text-red-300"
                                }`}
                        >
                            {projectedPositive
                                ? "Saldo positivo"
                                : "Saldo negativo"}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}