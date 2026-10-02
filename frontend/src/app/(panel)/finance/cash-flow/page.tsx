"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";

import { useCashFlowAnalytics } from "../hooks/use-cash-flow-analytics";

import type { CashFlowTab } from "./components/cash-flow-tabs";

import { CashFlowTabs } from "./components/cash-flow-tabs";
import { OverviewKPIs } from "./components/overview-kpis";
import { CashFlowEvolutionCombo } from "./components/cash-flow-evo-combo";
import { SavingsRateEvolution } from "./components/savings-rate-evolution";
import { OverviewInsights } from "./components/overview-insights";
import { TopCategoriesBar } from "./components/top-categories-bar";
import { CategoryStackedBar } from "./components/category-stacked-bar";
import { ExpenseDonut } from "./components/expense-donut";
import { CategoryVariationTable } from "./components/category-variation-table";
import { PlannedVsActualBars } from "./components/planned-vs-actual-bars";
import { BudgetPlaceholder } from "./components/budget-placeholder";
import { RecurringExpensesList } from "./components/recurring-expenses-list";
import { CommittedIncome } from "./components/committed-income";
import { FinancialMargin } from "./components/financial-margin";
import { CashFlowHeader } from "./components/cash-flow-header";

export default function CashFlowPage() {
    const [activeTab, setActiveTab] =
        useState<CashFlowTab>("overview");

    const [months, setMonths] = useState<number>(6);

    const { data, loading, error } =
        useCashFlowAnalytics({
            months,
        });

    /*
     * Loading
     */
    if (loading) {
        return (
            <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b border-border pb-6">
                        <div className="space-y-2">
                            <div className="h-8 w-52 animate-pulse rounded-md bg-muted" />

                            <div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />

                            <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:w-[180px]" />
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map(
                            (_, index) => (
                                <div
                                    key={index}
                                    className="h-[125px] animate-pulse rounded-xl border border-border bg-muted/50"
                                />
                            )
                        )}
                    </div>

                    {/* Charts */}
                    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                        <div className="h-[390px] animate-pulse rounded-xl border border-border bg-muted/50" />

                        <div className="h-[390px] animate-pulse rounded-xl border border-border bg-muted/50" />
                    </div>
                </div>
            </main>
        );
    }

    /*
     * Error
     */
    if (error) {
        return (
            <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <header className="border-b border-border pb-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#053032]/10 text-[#053032] dark:bg-emerald-400/10 dark:text-emerald-400">
                            <BarChart3 className="h-4 w-4" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Análise de fluxo
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Entenda como seu dinheiro está
                                entrando, saindo e evoluindo.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="mt-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            Não foi possível carregar a análise
                            financeira.
                        </p>

                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                            {error}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (!data) {
        return null;
    }

    /*
     * Current month
     */
    const currentMonth =
        data.evolution.length > 0
            ? data.evolution[data.evolution.length - 1]
            : {
                inflows: 0,
                outflows: 0,
                balance: 0,
            };

    return (
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* HEADER */}
            <header>
                <div className="flex flex-col gap-6">
                    <CashFlowHeader />

                    {/* Navigation + period */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CashFlowTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />

                        <Select
                            value={months.toString()}
                            onValueChange={(value) =>
                                setMonths(Number(value))
                            }
                        >
                            <SelectTrigger className="h-9 w-full text-xs sm:w-[180px]">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="3">
                                    Últimos 3 meses
                                </SelectItem>

                                <SelectItem value="6">
                                    Últimos 6 meses
                                </SelectItem>

                                <SelectItem value="12">
                                    Últimos 12 meses
                                </SelectItem>

                                <SelectItem value="24">
                                    Últimos 2 anos
                                </SelectItem>

                                <SelectItem value="60">
                                    Últimos 5 anos
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            {/* =====================================================
                OVERVIEW
            ====================================================== */}
            {activeTab === "overview" && (
                <div className="mt-6 space-y-5">
                    {/* KPIs */}
                    <section>
                        <OverviewKPIs
                            inflows={currentMonth.inflows}
                            outflows={currentMonth.outflows}
                        />
                    </section>

                    {/* Evolution */}
                    <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                        <CashFlowEvolutionCombo
                            data={data.evolution}
                        />

                        <SavingsRateEvolution
                            data={data.evolution}
                        />
                    </section>

                    {/* Insights */}
                    <section>
                        <OverviewInsights
                            evolution={data.evolution}
                            categoryEvolution={
                                data.categoryEvolution
                            }
                        />
                    </section>
                </div>
            )}

            {/* =====================================================
                EXPENSES
            ====================================================== */}
            {activeTab === "expenses" && (
                <div className="mt-6 space-y-5">
                    {/* Top categories + donut */}
                    <section className="grid gap-5 lg:grid-cols-2">
                        <TopCategoriesBar
                            data={data.categoryEvolution}
                        />

                        <ExpenseDonut
                            data={data.categoryEvolution}
                        />
                    </section>

                    {/* Category evolution + variation */}
                    <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                        <CategoryStackedBar
                            data={data.categoryEvolution}
                        />

                        <CategoryVariationTable
                            data={data.categoryEvolution}
                        />
                    </section>
                </div>
            )}

            {/* =====================================================
                PLANNING
            ====================================================== */}
            {activeTab === "planning" && (
                <div className="mt-6 space-y-5">
                    {/* Planned vs actual */}
                    <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                        <PlannedVsActualBars
                            data={data.plannedVsActual}
                        />

                        <div className="space-y-5">
                            <CommittedIncome
                                recurringExpenses={
                                    data.recurringExpenses
                                }
                                evolution={data.evolution}
                            />

                            <FinancialMargin
                                recurringExpenses={
                                    data.recurringExpenses
                                }
                                evolution={data.evolution}
                            />
                        </div>
                    </section>

                    {/* Recurring + budgets */}
                    <section className="grid gap-5 lg:grid-cols-2">
                        <RecurringExpensesList
                            data={data.recurringExpenses}
                        />

                        <BudgetPlaceholder />
                    </section>
                </div>
            )}
        </main>
    );
}