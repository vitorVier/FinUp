"use client";

import type { PlannedVsActual } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

interface PlannedVsActualBarsProps {
    data: PlannedVsActual[];
}

export function PlannedVsActualBars({
    data,
}: PlannedVsActualBarsProps) {
    const sorted = [...data].sort(
        (a, b) => b.actual + b.planned - (a.actual + a.planned)
    );

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <h2 className="text-sm font-semibold">
                    Previsto × Realizado por categoria
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    Progresso do mês atual
                </p>
            </div>

            <div className="p-5">
                {sorted.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Sem dados de planejamento para este mês.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sorted.map((item) => {
                            const total =
                                item.planned + item.actual;
                            const maxVal = Math.max(
                                item.planned,
                                item.actual,
                                1
                            );
                            const actualPct =
                                (item.actual / maxVal) * 100;
                            const exceeded =
                                item.actual > item.planned &&
                                item.planned > 0;

                            return (
                                <div key={item.categoryId}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium">
                                            {item.categoryName}
                                        </span>

                                        <div className="flex items-center gap-2 text-[11px]">
                                            <span className="text-muted-foreground">
                                                {formatBRL(
                                                    item.actual
                                                )}{" "}
                                                /{" "}
                                                {formatBRL(
                                                    item.planned
                                                )}
                                            </span>

                                            {item.planned >
                                                0 && (
                                                <span
                                                    className={`font-medium ${
                                                        exceeded
                                                            ? "text-red-600"
                                                            : "text-emerald-600"
                                                    }`}
                                                >
                                                    {item.differencePercent >
                                                    0
                                                        ? "+"
                                                        : ""}
                                                    {item.differencePercent.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                                                exceeded
                                                    ? "bg-red-500"
                                                    : "bg-[#053032]"
                                            }`}
                                            style={{
                                                width: `${Math.min(actualPct, 100)}%`,
                                            }}
                                        />

                                        {exceeded && (
                                            <div
                                                className="absolute top-0 h-full rounded-r-full bg-red-300/60"
                                                style={{
                                                    left: `${(item.planned / maxVal) * 100}%`,
                                                    width: `${Math.min(((item.actual - item.planned) / maxVal) * 100, 100 - (item.planned / maxVal) * 100)}%`,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
