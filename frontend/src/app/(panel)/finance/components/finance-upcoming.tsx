import {
    AlertCircle,
    CalendarClock,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    ShoppingCart,
    Utensils,
    Car,
    Home,
    Wallet,
    Banknote,
    Briefcase,
    CreditCard,
    Tag,
} from "lucide-react";

const iconMap = {
    ArrowUpRight,
    ArrowDownLeft,
    ShoppingCart,
    Utensils,
    Car,
    Home,
    Wallet,
    Banknote,
    Briefcase,
    CreditCard,
    Tag,
} as const;

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import {
    formatDate,
    isOverdue,
} from "../utils/utils";
import { formatBRL } from "@/src/lib/utils";

import type { Transaction } from "../types";

interface FinanceUpcomingProps {
    transactions: Transaction[];
}

export function FinanceUpcoming({
    transactions,
}: FinanceUpcomingProps) {
    const upcoming = [...transactions]
        .filter(
            (transaction) =>
                transaction.status === "PENDING"
        )
        .sort(
            (a, b) =>
                new Date(`${a.date}T00:00:00`).getTime() -
                new Date(`${b.date}T00:00:00`).getTime()
        )
        .slice(0, 6);

    const overdueCount = upcoming.filter(isOverdue).length;

    return (
        <Card className="h-full overflow-hidden border-border/80">
            <CardHeader className="flex-col border-b border-border/70 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#053032]/8">
                                <CalendarClock className="h-4 w-4 text-[#053032]" />
                            </div>

                            <CardTitle className="text-base">
                                Próximos vencimentos
                            </CardTitle>
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground">
                            Lançamentos previstos ainda não realizados.
                        </p>
                    </div>

                    {overdueCount > 0 && (
                        <div className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                            {overdueCount} atrasado
                            {overdueCount > 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="!p-0">
                {upcoming.length === 0 ? (
                    <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
                            <CalendarClock className="h-5 w-5 text-emerald-600" />
                        </div>

                        <p className="mt-3 text-sm font-medium">
                            Tudo em dia
                        </p>

                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Não existem vencimentos previstos para este mês.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/70">
                        {upcoming.map((transaction: Transaction) => {
                            const overdue = isOverdue(transaction);

                            const Icon =
                                iconMap[
                                transaction.category.icon as keyof typeof iconMap
                                ] || ArrowDownLeft;

                            return (
                                <div
                                    key={transaction.id}
                                    className={`group flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/40 ${overdue ? "bg-red-50/40" : ""
                                        }`}
                                >
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                        style={{
                                            backgroundColor: `${transaction.category.color}18`,
                                        }}
                                    >
                                        <Icon
                                            className="h-4 w-4"
                                            style={{
                                                color: transaction.category.color,
                                            }}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {transaction.description ||
                                                transaction.category.name}
                                        </p>

                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                            <span
                                                className={
                                                    overdue
                                                        ? "font-medium text-red-600"
                                                        : ""
                                                }
                                            >
                                                {formatDate(transaction.date)}
                                            </span>

                                            <span>•</span>

                                            <span className="truncate">
                                                {transaction.category.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {formatBRL(Number(transaction.value))}
                                            </p>

                                            {overdue && (
                                                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-red-600">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Atrasado
                                                </div>
                                            )}
                                        </div>

                                        <ChevronRight className="hidden h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 sm:block" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}