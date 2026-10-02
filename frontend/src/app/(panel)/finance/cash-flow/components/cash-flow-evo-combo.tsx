"use client";

import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { MonthlyCashFlow } from "../../types/analytics";

interface CashFlowEvolutionComboProps {
    data: MonthlyCashFlow[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
    }).format(value);

const formatLegend = (value: string) => {
    if (value === "inflows") return "Entradas";
    if (value === "outflows") return "Saídas";
    if (value === "balance") return "Saldo";

    return value;
};

export function CashFlowEvolutionCombo({
    data,
}: CashFlowEvolutionComboProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Header */}
            <div className="border-b border-border/70 px-5 py-4">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Evolução do fluxo de caixa
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Compare entradas, saídas e saldo ao longo dos últimos
                    meses.
                </p>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 pt-4">
                {data.length === 0 ? (
                    <div className="flex h-[320px] items-center justify-center">
                        <div className="max-w-xs text-center">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <span className="text-sm text-muted-foreground">
                                    —
                                </span>
                            </div>

                            <p className="mt-3 text-sm font-medium">
                                Nenhum dado disponível
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Registre entradas ou saídas para acompanhar a
                                evolução do seu fluxo de caixa.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    className="stroke-border/50"
                                />

                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    className="fill-muted-foreground"
                                    dy={8}
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={72}
                                    tick={{
                                        fontSize: 11,
                                    }}
                                    tickFormatter={(value) =>
                                        formatCurrency(Number(value))
                                    }
                                    className="fill-muted-foreground"
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "hsl(var(--muted))",
                                        opacity: 0.35,
                                    }}
                                    formatter={(value, name) => [
                                        formatCurrency(Number(value)),
                                        formatLegend(String(name)),
                                    ]}
                                    labelFormatter={(label) => label}
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid hsl(var(--border))",
                                        backgroundColor:
                                            "hsl(var(--card))",
                                        boxShadow:
                                            "0 6px 20px rgba(0, 0, 0, 0.08)",
                                        fontSize: "12px",
                                        padding: "10px 12px",
                                    }}
                                    labelStyle={{
                                        marginBottom: 6,
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "hsl(var(--foreground))",
                                    }}
                                />

                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    height={32}
                                    iconType="circle"
                                    iconSize={7}
                                    formatter={formatLegend}
                                    wrapperStyle={{
                                        fontSize: "11px",
                                        paddingBottom: "4px",
                                    }}
                                />

                                <Bar
                                    dataKey="inflows"
                                    name="inflows"
                                    fill="#16A34A"
                                    radius={[4, 4, 0, 0]}
                                    barSize={26}
                                    fillOpacity={0.85}
                                />

                                <Bar
                                    dataKey="outflows"
                                    name="outflows"
                                    fill="#DC2626"
                                    radius={[4, 4, 0, 0]}
                                    barSize={26}
                                    fillOpacity={0.85}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="balance"
                                    name="balance"
                                    stroke="#053032"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{
                                        r: 4,
                                        strokeWidth: 2,
                                        fill: "#053032",
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}