"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { MonthlyCashFlow } from "../../types/analytics";

interface SavingsRateEvolutionProps {
    data: MonthlyCashFlow[];
}

export function SavingsRateEvolution({
    data,
}: SavingsRateEvolutionProps) {
    const chartData = data.map((month) => ({
        label: month.label,
        rate:
            month.inflows > 0
                ? Number(
                    (
                        ((month.inflows - month.outflows) /
                            month.inflows) *
                        100
                    ).toFixed(1)
                )
                : 0,
    }));

    const currentRate =
        chartData.length > 0
            ? chartData[chartData.length - 1].rate
            : null;

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                        Evolução da taxa de poupança
                    </h2>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Percentual da renda que permaneceu disponível
                        após as saídas.
                    </p>
                </div>

                {currentRate !== null && (
                    <div className="rounded-lg bg-muted/50 px-3 py-1.5 text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Último mês
                        </p>

                        <p
                            className={`text-sm font-bold ${currentRate >= 0
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                        >
                            {currentRate.toFixed(1)}%
                        </p>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="p-5">
                {data.length === 0 ? (
                    <div className="flex h-[240px] flex-col items-center justify-center text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm text-muted-foreground">
                                %
                            </span>
                        </div>

                        <p className="mt-3 text-sm font-medium">
                            Nenhum dado disponível
                        </p>

                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Registre entradas e saídas para acompanhar a
                            evolução da sua taxa de poupança.
                        </p>
                    </div>
                ) : (
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <LineChart
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
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    className="fill-muted-foreground"
                                    padding={{
                                        left: 10,
                                        right: 10,
                                    }}
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={50}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    tickFormatter={(value) =>
                                        `${value}%`
                                    }
                                    className="fill-muted-foreground"
                                />

                                <Tooltip
                                    cursor={{
                                        stroke:
                                            "hsl(var(--border))",
                                        strokeDasharray: "4 4",
                                    }}
                                    formatter={(value) => [
                                        `${Number(value).toFixed(1)}%`,
                                        "Taxa de poupança",
                                    ]}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor:
                                            "hsl(var(--card))",
                                        boxShadow:
                                            "0 4px 14px rgba(0,0,0,0.08)",
                                        fontSize: "12px",
                                    }}
                                    labelStyle={{
                                        marginBottom: "4px",
                                        fontWeight: 600,
                                        color: "hsl(var(--foreground))",
                                    }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    name="Taxa"
                                    stroke="#053032"
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 3,
                                        strokeWidth: 2,
                                        fill: "hsl(var(--card))",
                                    }}
                                    activeDot={{
                                        r: 5,
                                        strokeWidth: 2,
                                        fill: "#053032",
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}