"use client";

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import { toNumber } from "../utils";
import { formatBRL } from "@/src/lib/utils";

import type { Transaction } from "../types";

interface FinanceExpenseChartProps {
    transactions: Transaction[];
}

export function FinanceExpenseChart({
    transactions,
}: FinanceExpenseChartProps) {
    const grouped = transactions.reduce<
        Record<
            string,
            {
                name: string;
                value: number;
                color: string;
            }
        >
    >((acc, transaction) => {
        if (transaction.status === "CANCELLED") {
            return acc;
        }

        const categoryId = transaction.category.id;

        if (!acc[categoryId]) {
            acc[categoryId] = {
                name: transaction.category.name,
                value: 0,
                color: transaction.category.color,
            };
        }

        acc[categoryId].value += toNumber(
            transaction.value
        );

        return acc;
    }, {});

    const allData = Object.values(grouped).sort(
        (a, b) => b.value - a.value
    );

    const data = allData.slice(0, 6);

    const otherValue = allData
        .slice(6)
        .reduce(
            (sum, item) => sum + item.value,
            0
        );

    if (otherValue > 0) {
        data.push({
            name: "Outros",
            value: otherValue,
            color: "#94a3b8",
        });
    }

    const total = data.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <Card className="h-full overflow-hidden border-border/80">
            <CardHeader className="flex-col border-b border-border/70 pb-4">
                <div>
                    <CardTitle className="text-base">
                        Saídas por categoria
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Onde seu dinheiro está sendo gasto neste mês.
                    </p>
                </div>
            </CardHeader>

            <CardContent>
                {data.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                            <span className="text-lg">◔</span>
                        </div>

                        <p className="mt-3 text-sm font-medium">
                            Nenhuma saída registrada
                        </p>

                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Registre seus gastos para acompanhar a distribuição por categoria.
                        </p>
                    </div>
                ) : (
                    <div className="grid items-center gap-5 md:grid-cols-[1fr_190px]">
                        <div className="relative h-[280px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={72}
                                        outerRadius={105}
                                        paddingAngle={3}
                                        strokeWidth={0}
                                    >
                                        {data.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
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
                                            border: "1px solid #e5e7eb",
                                            boxShadow:
                                                "0 4px 14px rgba(0,0,0,0.08)",
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

                                <span className="mt-0.5 text-[10px] text-muted-foreground">
                                    em saídas
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {data.map((item) => {
                                const percentage =
                                    total > 0
                                        ? (item.value /
                                            total) *
                                        100
                                        : 0;

                                return (
                                    <div
                                        key={item.name}
                                        className="group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        item.color,
                                                }}
                                            />

                                            <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                                {item.name}
                                            </span>

                                            <span className="text-xs font-semibold">
                                                {percentage.toFixed(
                                                    0
                                                )}
                                                %
                                            </span>
                                        </div>

                                        <div className="mt-1.5 flex justify-between pl-[18px]">
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatBRL(
                                                    item.value
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}