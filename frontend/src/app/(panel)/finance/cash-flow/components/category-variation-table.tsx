"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import type { CategoryMonthlyExpense } from "../../types/analytics";
import { formatBRL } from "@/src/lib/utils";

interface CategoryVariationTableProps {
    data: CategoryMonthlyExpense[];
}

export function CategoryVariationTable({
    data,
}: CategoryVariationTableProps) {
    if (data.length < 2) {
        return (
            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border/70 px-5 py-4">
                    <h2 className="text-sm font-semibold">
                        Variação vs. mês anterior
                    </h2>
                </div>
                <div className="flex h-[200px] items-center justify-center p-5">
                    <p className="text-sm text-muted-foreground">
                        São necessários pelo menos 2 meses de dados.
                    </p>
                </div>
            </div>
        );
    }

    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    const allCategories = new Set([
        ...Object.keys(current.categories),
        ...Object.keys(previous.categories),
    ]);

    const rows = Array.from(allCategories)
        .map((category) => {
            const currentVal = current.categories[category] ?? 0;
            const previousVal =
                previous.categories[category] ?? 0;
            const variation =
                previousVal > 0
                    ? ((currentVal - previousVal) /
                          previousVal) *
                      100
                    : currentVal > 0
                      ? 100
                      : 0;

            return {
                category,
                currentVal,
                previousVal,
                variation,
            };
        })
        .sort((a, b) => b.currentVal - a.currentVal);

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
                <h2 className="text-sm font-semibold">
                    Variação vs. mês anterior
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                    Comparação categoria a categoria
                </p>
            </div>

            <div className="p-5">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-border/60 text-muted-foreground">
                                <th className="pb-2.5 text-left font-medium">
                                    Categoria
                                </th>
                                <th className="pb-2.5 text-right font-medium">
                                    Atual
                                </th>
                                <th className="pb-2.5 text-right font-medium">
                                    Anterior
                                </th>
                                <th className="pb-2.5 text-right font-medium">
                                    Variação
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => {
                                const up = row.variation > 0;
                                const down =
                                    row.variation < 0;

                                return (
                                    <tr
                                        key={row.category}
                                        className="border-b border-border/30 last:border-0"
                                    >
                                        <td className="py-2.5 font-medium">
                                            {row.category}
                                        </td>

                                        <td className="py-2.5 text-right">
                                            {formatBRL(
                                                row.currentVal
                                            )}
                                        </td>

                                        <td className="py-2.5 text-right text-muted-foreground">
                                            {formatBRL(
                                                row.previousVal
                                            )}
                                        </td>

                                        <td className="py-2.5 text-right">
                                            <span
                                                className={`inline-flex items-center gap-1 font-medium ${
                                                    up
                                                        ? "text-red-600"
                                                        : down
                                                          ? "text-emerald-600"
                                                          : "text-muted-foreground"
                                                }`}
                                            >
                                                {up ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : down ? (
                                                    <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <Minus className="h-3 w-3" />
                                                )}
                                                {Math.abs(
                                                    row.variation
                                                ).toFixed(
                                                    1
                                                )}
                                                %
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
