"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { CategoryMonthlyExpense } from "../../types/analytics";

interface CategoryStackedBarProps {
    data: CategoryMonthlyExpense[];
}

import { getCategoryColorByName } from "../../utils/utils";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value);

export function CategoryStackedBar({
    data,
}: CategoryStackedBarProps) {
    /* Discover top 5 categories across entire period */
    const categoryTotals = data.reduce<Record<string, number>>(
        (totals, month) => {
            Object.entries(month.categories).forEach(
                ([cat, val]) => {
                    totals[cat] = (totals[cat] ?? 0) + Number(val);
                }
            );
            return totals;
        },
        {}
    );

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([cat]) => cat);

    /* Build chart data with "Outros" rollup */
    const chartData = data.map((month) => {
        const result: Record<string, string | number> = {
            month: month.label,
        };

        let others = 0;

        Object.entries(month.categories).forEach(
            ([cat, val]) => {
                const num = Number(val);
                if (topCategories.includes(cat)) {
                    result[cat] = num;
                } else {
                    others += num;
                }
            }
        );

        if (others > 0) {
            result.Outros = others;
        }

        return result;
    });

    const categories = [
        ...topCategories,
        ...(chartData.some(
            (m) => Number(m.Outros ?? 0) > 0
        )
            ? ["Outros"]
            : []),
    ];

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <h2 className="text-sm font-semibold">
                    Evolução dos gastos por categoria
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    Barras empilhadas — 6 meses
                </p>
            </div>

            <div className="p-5">
                {data.length === 0 ||
                categories.length === 0 ? (
                    <div className="flex h-[320px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Não há dados suficientes para exibir o
                            gráfico.
                        </p>
                    </div>
                ) : (
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    className="stroke-border/60"
                                />

                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    className="fill-muted-foreground"
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={70}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    tickFormatter={(v) =>
                                        formatCurrency(v)
                                    }
                                    className="fill-muted-foreground"
                                />

                                <Tooltip
                                    formatter={(
                                        value,
                                        name
                                    ) => [
                                        formatCurrency(
                                            Number(value)
                                        ),
                                        name,
                                    ]}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor:
                                            "hsl(var(--card))",
                                        fontSize: "12px",
                                    }}
                                />

                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    height={30}
                                    wrapperStyle={{
                                        fontSize: "11px",
                                    }}
                                />

                                {categories.map(
                                    (cat, index) => (
                                        <Bar
                                            key={cat}
                                            dataKey={cat}
                                            stackId="expenses"
                                            fill={
                                                cat === "Outros"
                                                    ? "#94A3B8"
                                                    : getCategoryColorByName(cat, "OUTFLOW")
                                            }
                                            radius={
                                                index ===
                                                categories.length -
                                                    1
                                                    ? [
                                                          4,
                                                          4,
                                                          0,
                                                          0,
                                                      ]
                                                    : undefined
                                            }
                                        />
                                    )
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
