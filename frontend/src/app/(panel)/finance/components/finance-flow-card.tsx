import {
    ArrowDown,
    ArrowUp,
    CircleDollarSign,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import { formatCurrency } from "../utils";

interface FinanceFlowCardProps {
    type: "inflow" | "outflow";
    realized: number;
    projected: number;
}

export function FinanceFlowCard({
    type,
    realized,
    projected,
}: FinanceFlowCardProps) {
    const inflow = type === "inflow";

    const title = inflow
        ? "Entradas"
        : "Saídas";

    const Icon = inflow
        ? ArrowUp
        : ArrowDown;

    const total = realized + projected;

    const percentage =
        total > 0
            ? Math.min((realized / total) * 100, 100)
            : 0;

    const color = inflow
        ? "text-emerald-600"
        : "text-red-600";

    const softColor = inflow
        ? "bg-emerald-500/10"
        : "bg-red-500/10";

    const progressColor = inflow
        ? "bg-emerald-500"
        : "bg-red-500";

    return (
        <Card className="overflow-hidden border-border/80 transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex w-full flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex w-full flex-col">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>

                    <p className="mt-1 text-xs text-muted-foreground/70">
                        {inflow
                            ? "Dinheiro que entrou ou ainda entrará"
                            : "Gastos realizados ou previstos"}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${softColor}`}
                >
                    <Icon
                        className={`h-5 w-5 ${color}`}
                        strokeWidth={2.2}
                    />
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className={`text-2xl font-bold tracking-tight ${color}`}>
                            {formatCurrency(realized)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            realizado
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(total)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            total projetado
                        </p>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            Realizado
                        </span>

                        <span className="font-medium">
                            {percentage.toFixed(0)}%
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                            style={{
                                width: `${percentage}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                    <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />

                        <span className="text-xs text-muted-foreground">
                            Previsto
                        </span>
                    </div>

                    <span className="text-sm font-semibold">
                        {formatCurrency(projected)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}