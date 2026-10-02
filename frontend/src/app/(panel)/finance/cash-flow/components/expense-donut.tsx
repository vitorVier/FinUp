"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import type { CategoryMonthlyExpense } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

interface ExpenseDonutProps {
    data: CategoryMonthlyExpense[];
}

import { getCategoryColorByName } from "../../utils/utils";

export function ExpenseDonut({
    data,
}: ExpenseDonutProps) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border/70 px-5 py-4">
                    <h2 className="text-sm font-semibold">
                        Distribuição percentual
                    </h2>
                </div>
                <div className="flex h-[300px] items-center justify-center p-5">
                    <p className="text-sm text-muted-foreground">
                        Sem dados de despesa no mês.
                    </p>
                </div>
            </div>
        );
    }

    const lastMonth = data[data.length - 1];
    const entries = Object.entries(lastMonth.categories).sort(
        ([, a], [, b]) => b - a
    );

    const top5 = entries.slice(0, 5);
    const othersValue = entries
        .slice(5)
        .reduce((sum, [, v]) => sum + v, 0);

    const chartData = [
        ...top5.map(([name, value]) => ({
            name,
            value,
            color: getCategoryColorByName(name, "OUTFLOW"),
        })),
        ...(othersValue > 0
            ? [
                {
                    name: "Outros",
                    value: othersValue,
                    color: "#94A3B8",
                },
            ]
            : []),
    ];

    const total = chartData.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <h2 className="text-sm font-semibold">
                    Distribuição percentual das despesas
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    Proporção de cada categoria no mês atual
                </p>
            </div>

            <div className="p-5">
                <div className="grid items-center gap-5 md:grid-cols-[1fr_180px]">
                    <div className="relative h-[280px]">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={72}
                                    outerRadius={105}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {chartData.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.color
                                                }
                                            />
                                        )
                                    )}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        formatBRL(
                                            Number(value)
                                        )
                                    }
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor:
                                            "hsl(var(--card))",
                                        fontSize: "12px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[11px] text-muted-foreground">
                                Total
                            </span>

                            <span className="mt-1 text-lg font-bold tracking-tight">
                                {formatBRL(total)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-1 pb-1 max-h-[250px]">
                        {chartData.map((item) => {
                            const pct =
                                total > 0
                                    ? ((item.value / total) * 100).toFixed(1)
                                    : "0.0";

                            return (
                                <div
                                    key={item.name}
                                    className="group relative flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 transition-all hover:bg-muted/50"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />

                                        <div className="flex flex-col truncate">
                                            <span className="truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-foreground/80">
                                                {item.name}
                                            </span>
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {formatBRL(item.value)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ml-3 flex shrink-0 items-center justify-end rounded-md bg-muted/40 px-2 py-1 transition-colors group-hover:bg-background shadow-sm">
                                        <span className="text-[11px] font-bold tabular-nums text-foreground/90" style={{ color: item.color }}>
                                            {pct}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
