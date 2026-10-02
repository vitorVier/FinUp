"use client";

import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import type {
    MonthlyCashFlow,
    CategoryMonthlyExpense,
} from "../../types/analytics";

interface OverviewInsightsProps {
    evolution: MonthlyCashFlow[];
    categoryEvolution: CategoryMonthlyExpense[];
}

interface InsightCard {
    type: "positive" | "warning";
    title: string;
    description: string;
}

export function OverviewInsights({
    evolution,
    categoryEvolution,
}: OverviewInsightsProps) {
    const insights: (InsightCard | null)[] = [];

    /*
     * Insight 1 — Comparação com o mês anterior
     * (saídas_mês_atual − saídas_mês_anterior) / saídas_mês_anterior × 100
     */
    if (evolution.length >= 2) {
        const current = evolution[evolution.length - 1];
        const previous = evolution[evolution.length - 2];

        if (previous.outflows > 0) {
            const variation =
                ((current.outflows - previous.outflows) /
                    previous.outflows) *
                100;

            insights.push({
                type: variation > 0 ? "warning" : "positive",
                title:
                    variation > 0
                        ? "Gastos aumentaram"
                        : "Gastos diminuíram",
                description:
                    variation > 0
                        ? `Você gastou ${Math.abs(variation).toFixed(1)}% a mais que no mês passado`
                        : `Você gastou ${Math.abs(variation).toFixed(1)}% a menos que no mês passado`,
            });
        } else {
            insights.push(null);
        }
    } else {
        insights.push(null);
    }

    /*
     * Insight 2 — Categoria que mais variou
     * Entre todas as categorias de saída, a de maior |variação%| vs mês anterior
     */
    if (categoryEvolution.length >= 2) {
        const currentCats =
            categoryEvolution[categoryEvolution.length - 1]
                .categories;
        const previousCats =
            categoryEvolution[categoryEvolution.length - 2]
                .categories;

        const allCategories = new Set([
            ...Object.keys(currentCats),
            ...Object.keys(previousCats),
        ]);

        let maxVariation = 0;
        let maxCategory = "";
        let maxDirection: "up" | "down" = "up";

        allCategories.forEach((category) => {
            const current = currentCats[category] ?? 0;
            const previous = previousCats[category] ?? 0;

            if (previous > 0) {
                const variation =
                    ((current - previous) / previous) * 100;
                if (Math.abs(variation) > Math.abs(maxVariation)) {
                    maxVariation = variation;
                    maxCategory = category;
                    maxDirection = variation > 0 ? "up" : "down";
                }
            }
        });

        if (maxCategory && Math.abs(maxVariation) >= 1) {
            insights.push({
                type: maxDirection === "up" ? "warning" : "positive",
                title: "Categoria com maior variação",
                description:
                    maxDirection === "up"
                        ? `${maxCategory} subiu ${Math.abs(maxVariation).toFixed(0)}% em relação ao mês passado`
                        : `${maxCategory} caiu ${Math.abs(maxVariation).toFixed(0)}% em relação ao mês passado`,
            });
        } else {
            insights.push(null);
        }
    } else {
        insights.push(null);
    }

    /*
     * Insight 3 — Saldo projetado vs. média
     * saldo_projetado = realizado + previsto do mês atual
     * média = saldo realizado dos 3 meses anteriores
     *
     * Nota: Como o endpoint A retorna apenas CONFIRMED no inflows/outflows,
     * e o mês atual pode ter PENDING, usamos o balance do mês atual como proxy
     * do "realizado + previsto" (buildCashFlowEvolution já separa CONFIRMED).
     * O saldo_projetado aqui é conservador — usa o que já realizou.
     */
    if (evolution.length >= 4) {
        const current = evolution[evolution.length - 1];
        const previousMonths = evolution.slice(-4, -1);

        const averageBalance =
            previousMonths.reduce(
                (sum, month) => sum + month.balance,
                0
            ) / previousMonths.length;

        if (Math.abs(averageBalance) > 0) {
            const variation =
                ((current.balance - averageBalance) /
                    Math.abs(averageBalance)) *
                100;

            insights.push({
                type: variation >= 0 ? "positive" : "warning",
                title:
                    variation >= 0
                        ? "Saldo acima da média"
                        : "Saldo abaixo da média",
                description:
                    variation >= 0
                        ? `Seu saldo projetado está ${Math.abs(variation).toFixed(0)}% acima da média dos últimos 3 meses`
                        : `Seu saldo projetado está ${Math.abs(variation).toFixed(0)}% abaixo da média dos últimos 3 meses`,
            });
        } else {
            insights.push(null);
        }
    } else {
        insights.push(null);
    }

    const filledInsights = insights.filter(
        (i): i is InsightCard => i !== null
    );

    if (filledInsights.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex min-h-[80px] items-center justify-center text-center">
                    <div>
                        <p className="text-sm font-medium">
                            Ainda não há insights suficientes
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Continue registrando seus lançamentos para
                            gerar análises.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filledInsights.map((insight, index) => {
                const isPositive = insight.type === "positive";
                const Icon = isPositive
                    ? TrendingUp
                    : AlertTriangle;

                return (
                    <div
                        key={`insight-${index}`}
                        className={`rounded-xl border p-4 shadow-sm ${isPositive
                                ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                                : "border-amber-200/60 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
                            }`}
                    >
                        <div className="flex gap-3">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPositive
                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold">
                                    {insight.title}
                                </p>

                                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
