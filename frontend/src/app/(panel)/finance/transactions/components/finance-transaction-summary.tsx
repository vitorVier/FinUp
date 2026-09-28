import {
    ArrowDownLeft,
    ArrowUpRight,
    Clock3,
    Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";

interface Summary {
    confirmedInflows: number;
    confirmedOutflows: number;
    pendingInflows: number;
    pendingOutflows: number;
    balance: number;
    pending: number;
}

interface Props {
    summary: Summary;
    loading?: boolean;
}

function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function FinanceTransactionSummary({
    summary,
    loading,
}: Props) {
    const cards = [
        {
            label: "Entradas realizadas",
            value: summary.confirmedInflows,
            helper: "Valores já recebidos",
            icon: ArrowDownLeft,
            iconClass: "text-emerald-600",
            iconBg: "bg-emerald-500/10",
        },
        {
            label: "Saídas realizadas",
            value: summary.confirmedOutflows,
            helper: "Valores já pagos",
            icon: ArrowUpRight,
            iconClass: "text-red-600",
            iconBg: "bg-red-500/10",
        },
        {
            label: "Saldo realizado",
            value: summary.balance,
            helper: "Entradas − saídas",
            icon: Wallet,
            iconClass:
                summary.balance >= 0
                    ? "text-[#053032]"
                    : "text-red-600",
            iconBg:
                summary.balance >= 0
                    ? "bg-[#053032]/10"
                    : "bg-red-500/10",
            highlight: true,
        },
        {
            label: "Valores pendentes",
            value: summary.pending,
            helper: "Ainda não realizados",
            icon: Clock3,
            iconClass: "text-amber-600",
            iconBg: "bg-amber-500/10",
        },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <Card
                        key={card.label}
                        className="overflow-hidden"
                    >
                        <CardContent className="p-5">
                            <div className="space-y-3">
                                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-7 w-40 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <Card
                        key={card.label}
                        className={`group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.highlight
                            ? "border-[#053032]/20 bg-[#053032]/[0.025]"
                            : ""
                            }`}
                    >
                        <CardContent className="p-5 pt-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        {card.label}
                                    </p>

                                    <p
                                        className={`mt-2 truncate text-xl font-bold tracking-tight ${card.highlight
                                            ? card.iconClass
                                            : "text-foreground"
                                            }`}
                                    >
                                        {formatBRL(card.value)}
                                    </p>

                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {card.helper}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                                >
                                    <Icon
                                        className={`h-4.5 w-4.5 ${card.iconClass}`}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}