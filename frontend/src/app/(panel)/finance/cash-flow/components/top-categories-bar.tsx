"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { CategoryMonthlyExpense } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

import { getCategoryColorByName } from "../../utils/utils";

interface TopCategoriesBarProps {
    data: CategoryMonthlyExpense[];
}

export function TopCategoriesBar({
    data,
}: TopCategoriesBarProps) {
    /*
     * Estado vazio
     */
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-border/80 bg-card shadow-sm">
                <div className="border-b border-border/70 px-5 py-4">
                    <h2 className="text-sm font-semibold tracking-tight">
                        Top 5 categorias
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Maiores despesas do mês atual
                    </p>
                </div>

                <div className="flex min-h-[300px] items-center justify-center px-5 py-6 text-center">
                    <div>
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <span className="text-sm text-muted-foreground">
                                —
                            </span>
                        </div>

                        <p className="mt-3 text-sm font-medium">
                            Nenhuma despesa registrada
                        </p>

                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                            Quando houver despesas no mês,
                            elas aparecerão aqui por categoria.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Último mês = mês atual
     */
    const lastMonth =
        data[data.length - 1];

    /*
     * Ordena categorias pelo valor gasto
     */
    const entries = Object.entries(
        lastMonth.categories
    ).sort(([, a], [, b]) => b - a);

    /*
     * Top 5
     */
    const top5 = entries.slice(0, 5);

    /*
     * Demais categorias
     */
    const othersValue = entries
        .slice(5)
        .reduce(
            (sum, [, value]) => sum + value,
            0
        );

    /*
     * Dados do gráfico
     */
    const chartData = [
        ...top5.map(
            ([name, value]) => ({
                name,
                value,
                fill: getCategoryColorByName(name, "OUTFLOW"),
            })
        ),

        ...(othersValue > 0
            ? [
                {
                    name: "Outros",
                    value: othersValue,
                    fill: "#94A3B8",
                },
            ]
            : []),
    ];

    const total = chartData.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <div className="rounded-xl border border-border/80 bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                        Top 5 categorias
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Maiores despesas do mês atual
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Total
                    </p>

                    <p className="mt-0.5 text-sm font-semibold tracking-tight">
                        {formatBRL(total)}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="px-5 pb-5 pt-4">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                                top: 6,
                                right: 16,
                                left: 4,
                                bottom: 6,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                className="stroke-border/50"
                            />

                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fontSize: 10,
                                }}
                                tickFormatter={(value) =>
                                    formatBRL(value)
                                }
                                className="fill-muted-foreground"
                            />

                            <YAxis
                                type="category"
                                dataKey="name"
                                width={105}
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fontSize: 11,
                                }}
                                className="fill-foreground"
                            />

                            <Tooltip
                                cursor={{
                                    fill: "hsl(var(--muted))",
                                    opacity: 0.35,
                                }}
                                formatter={(value) => [
                                    formatBRL(
                                        Number(value)
                                    ),
                                    "Despesa",
                                ]}
                                contentStyle={{
                                    borderRadius: "10px",
                                    border:
                                        "1px solid hsl(var(--border))",
                                    backgroundColor:
                                        "hsl(var(--card))",
                                    boxShadow:
                                        "0 8px 24px rgba(0,0,0,0.08)",
                                    fontSize: "12px",
                                }}
                                labelStyle={{
                                    color:
                                        "hsl(var(--foreground))",
                                    fontWeight: 600,
                                    marginBottom: 4,
                                }}
                            />

                            <Bar
                                dataKey="value"
                                radius={[
                                    0,
                                    5,
                                    5,
                                    0,
                                ]}
                                barSize={20}
                                background={{
                                    fill: "hsl(var(--muted))",
                                    radius: 5,
                                }}
                            >
                                {chartData.map(
                                    (entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    )
                                )}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[10px] text-muted-foreground">
                        {chartData.length} categorias
                        exibidas
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                        Ordenado por maior gasto
                    </span>
                </div>
            </div>
        </div>
    );
}