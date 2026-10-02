"use client";

import {
    ArrowDownLeft,
    ArrowUpRight,
    Scale,
    TrendingUp,
} from "lucide-react";

import { formatBRL } from "@/src/lib/utils";

interface OverviewKPIsProps {
    inflows: number;
    outflows: number;
}

export function OverviewKPIs({
    inflows,
    outflows,
}: OverviewKPIsProps) {
    const balance = inflows - outflows;

    const savingsRate =
        inflows > 0
            ? Number(((balance / inflows) * 100).toFixed(1))
            : null;

    const cards = [
        {
            label: "Entradas no mês",
            description: "Dinheiro que entrou",
            value: formatBRL(inflows),
            icon: ArrowDownLeft,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
            valueColor: "text-emerald-600",
        },
        {
            label: "Saídas no mês",
            description: "Dinheiro que saiu",
            value: formatBRL(outflows),
            icon: ArrowUpRight,
            iconColor: "text-red-600",
            iconBg: "bg-red-50 dark:bg-red-950/30",
            valueColor: "text-red-600",
        },
        {
            label: "Saldo",
            description:
                balance >= 0
                    ? "Resultado positivo"
                    : "Resultado negativo",
            value: formatBRL(balance),
            icon: Scale,
            iconColor:
                balance >= 0
                    ? "text-emerald-600"
                    : "text-red-600",
            iconBg:
                balance >= 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-red-50 dark:bg-red-950/30",
            valueColor:
                balance >= 0
                    ? "text-emerald-600"
                    : "text-red-600",
        },
        {
            label: "Taxa de poupança",
            description:
                savingsRate !== null
                    ? "Percentual poupado"
                    : "Sem entradas no período",
            value:
                savingsRate !== null
                    ? `${savingsRate}%`
                    : "—",
            icon: TrendingUp,
            iconColor:
                savingsRate !== null && savingsRate >= 0
                    ? "text-emerald-600"
                    : "text-red-600",
            iconBg:
                savingsRate !== null && savingsRate >= 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-red-50 dark:bg-red-950/30",
            valueColor:
                savingsRate !== null && savingsRate >= 0
                    ? "text-emerald-600"
                    : "text-red-600",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.label}
                        className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {card.label}
                                </p>

                                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                                    {card.description}
                                </p>
                            </div>

                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                            >
                                <Icon
                                    className={`h-4 w-4 ${card.iconColor}`}
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <p
                                className={`text-xl font-bold tracking-tight ${card.valueColor}`}
                            >
                                {card.value}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}