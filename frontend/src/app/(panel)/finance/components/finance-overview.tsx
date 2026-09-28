"use client";

import { useEffect, useMemo, useState } from "react";

import {
    ArrowDown,
    ArrowUp,
    RefreshCw,
    TrendingUp,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

import { FinanceMonthSelector } from "./finance-month-selector";
import { FinanceFlowCard } from "./finance-flow-card";
import { FinanceBalanceCard } from "./finance-balance-card";
import { FinanceUpcoming } from "./finance-upcoming";
import { FinanceExpenseChart } from "./finance-expense-chart";

import type { Transaction } from "../types";

import {
    formatCurrency,
    isSameMonth,
    toNumber,
} from "../utils";

export function FinanceOverview() {
    const now = new Date();

    const [year, setYear] = useState(
        now.getFullYear()
    );

    const [month, setMonth] = useState(
        now.getMonth()
    );

    const [inflows, setInflows] = useState<
        Transaction[]
    >([]);

    const [outflows, setOutflows] = useState<
        Transaction[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] = useState<
        string | null
    >(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                inflowResponse,
                outflowResponse,
            ] = await Promise.all([
                fetch(
                    "/api/finance/transaction?type=INFLOW"
                ),
                fetch(
                    "/api/finance/transaction?type=OUTFLOW"
                ),
            ]);

            if (
                !inflowResponse.ok ||
                !outflowResponse.ok
            ) {
                throw new Error(
                    "Não foi possível carregar os dados financeiros."
                );
            }

            const [
                inflowData,
                outflowData,
            ] = await Promise.all([
                inflowResponse.json(),
                outflowResponse.json(),
            ]);

            setInflows(inflowData);
            setOutflows(outflowData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao carregar os dados financeiros."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const monthInflows = useMemo(
        () =>
            inflows.filter((transaction) =>
                isSameMonth(
                    transaction.date,
                    year,
                    month
                )
            ),
        [inflows, year, month]
    );

    const monthOutflows = useMemo(
        () =>
            outflows.filter((transaction) =>
                isSameMonth(
                    transaction.date,
                    year,
                    month
                )
            ),
        [outflows, year, month]
    );

    const inflowRealized = useMemo(
        () =>
            monthInflows
                .filter(
                    (transaction) =>
                        transaction.status ===
                        "CONFIRMED"
                )
                .reduce(
                    (sum, transaction) =>
                        sum +
                        toNumber(
                            transaction.value
                        ),
                    0
                ),
        [monthInflows]
    );

    const inflowProjected = useMemo(
        () =>
            monthInflows
                .filter(
                    (transaction) =>
                        transaction.status ===
                        "PENDING"
                )
                .reduce(
                    (sum, transaction) =>
                        sum +
                        toNumber(
                            transaction.value
                        ),
                    0
                ),
        [monthInflows]
    );

    const outflowRealized = useMemo(
        () =>
            monthOutflows
                .filter(
                    (transaction) =>
                        transaction.status ===
                        "CONFIRMED"
                )
                .reduce(
                    (sum, transaction) =>
                        sum +
                        toNumber(
                            transaction.value
                        ),
                    0
                ),
        [monthOutflows]
    );

    const outflowProjected = useMemo(
        () =>
            monthOutflows
                .filter(
                    (transaction) =>
                        transaction.status ===
                        "PENDING"
                )
                .reduce(
                    (sum, transaction) =>
                        sum +
                        toNumber(
                            transaction.value
                        ),
                    0
                ),
        [monthOutflows]
    );

    const realizedBalance =
        inflowRealized -
        outflowRealized;

    const projectedBalance =
        inflowRealized +
        inflowProjected -
        (outflowRealized +
            outflowProjected);

    const totalInflows =
        inflowRealized +
        inflowProjected;

    const totalOutflows =
        outflowRealized +
        outflowProjected;

    return (
        <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {/* HEADER */}
            <header className="mb-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-1">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Visão financeira
                            </h1>
                        </div>

                        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                            Acompanhe suas entradas, saídas,
                            saldo e compromissos financeiros
                            do mês.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <FinanceMonthSelector
                            year={year}
                            month={month}
                            onChange={(
                                newYear,
                                newMonth
                            ) => {
                                setYear(newYear);
                                setMonth(newMonth);
                            }}
                        />

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={loadData}
                            disabled={loading}
                            title="Atualizar dados"
                            className="h-10 w-10 rounded-xl"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${loading
                                    ? "animate-spin"
                                    : ""
                                    }`}
                            />
                        </Button>
                    </div>
                </div>

                <div className="mt-6 border-b border-border" />
            </header>

            {/* ERROR */}
            {error && (
                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadData}
                        className="text-red-700 hover:bg-red-100 hover:text-red-800"
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* CONTENT */}
            {loading ? (
                <FinanceLoading />
            ) : (
                <>
                    {/* RESUMO */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-sm font-semibold">
                                Resumo do mês
                            </h2>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Situação financeira de{" "}
                                {new Intl.DateTimeFormat(
                                    "pt-BR",
                                    {
                                        month: "long",
                                    }
                                ).format(
                                    new Date(
                                        year,
                                        month,
                                        1
                                    )
                                )}
                                .
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <FinanceFlowCard
                                type="inflow"
                                realized={
                                    inflowRealized
                                }
                                projected={
                                    inflowProjected
                                }
                            />

                            <FinanceFlowCard
                                type="outflow"
                                realized={
                                    outflowRealized
                                }
                                projected={
                                    outflowProjected
                                }
                            />

                            <FinanceBalanceCard
                                realized={
                                    realizedBalance
                                }
                                projected={
                                    projectedBalance
                                }
                            />
                        </div>
                    </section>

                    {/* VISÃO COMPLEMENTAR */}
                    <section className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-border/80 bg-card p-5 transition-shadow hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <ArrowUp className="h-4 w-4 text-emerald-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Entradas projetadas
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Realizadas + previstas
                                        </p>
                                    </div>
                                </div>

                                <span className="text-lg font-bold">
                                    {formatCurrency(
                                        totalInflows
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-card p-5 transition-shadow hover:shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                                        <ArrowDown className="h-4 w-4 text-red-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">
                                            Saídas projetadas
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Realizadas + previstas
                                        </p>
                                    </div>
                                </div>

                                <span className="text-lg font-bold">
                                    {formatCurrency(
                                        totalOutflows
                                    )}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* VENCIMENTOS + CATEGORIAS */}
                    <section className="mt-8">
                        <div className="mb-4">
                            <h2 className="text-sm font-semibold">
                                Acompanhamento
                            </h2>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Veja o que está por vir e onde seus gastos estão concentrados.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                            <FinanceUpcoming
                                transactions={
                                    monthOutflows
                                }
                            />

                            <FinanceExpenseChart
                                transactions={
                                    monthOutflows
                                }
                            />
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

function FinanceLoading() {
    return (
        <div className="space-y-8">
            <div>
                <div className="mb-4 h-4 w-32 animate-pulse rounded bg-muted" />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="h-[230px] animate-pulse rounded-xl border bg-muted/40" />
                    <div className="h-[230px] animate-pulse rounded-xl border bg-muted/40" />
                    <div className="h-[230px] animate-pulse rounded-xl border bg-muted/40" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[100px] animate-pulse rounded-xl border bg-muted/40" />
                <div className="h-[100px] animate-pulse rounded-xl border bg-muted/40" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                <div className="h-[430px] animate-pulse rounded-xl border bg-muted/40" />
                <div className="h-[430px] animate-pulse rounded-xl border bg-muted/40" />
            </div>
        </div>
    );
}