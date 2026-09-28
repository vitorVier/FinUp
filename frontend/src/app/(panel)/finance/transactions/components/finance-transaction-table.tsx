"use client";

import {
    Check,
    MoreHorizontal,
    Pencil,
    Trash2,
    ArrowDownLeft,
    ArrowUpRight,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "@/src/components/ui/card";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { Button } from "@/src/components/ui/button";

import { FinanceTransactionStatus } from "./finance-transaction-status";

import type {
    Transaction,
    TransactionStatus,
} from "../page";

interface Props {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onStatusChange: (
        transaction: Transaction,
        status: TransactionStatus
    ) => void;
}

function formatBRL(value: string | number) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatDate(date: string) {
    return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
        }
    );
}

function isToday(date: string) {
    const today = new Date();
    const value = new Date(`${date.slice(0, 10)}T12:00:00`);

    return (
        today.getFullYear() === value.getFullYear() &&
        today.getMonth() === value.getMonth() &&
        today.getDate() === value.getDate()
    );
}

export function FinanceTransactionTable({
    transactions,
    onEdit,
    onDelete,
    onStatusChange,
}: Props) {
    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <CardContent className="!p-0">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3.5 font-semibold">
                                    Data
                                </th>

                                <th className="px-4 py-3.5 font-semibold">
                                    Lançamento
                                </th>

                                <th className="px-4 py-3.5 font-semibold">
                                    Categoria
                                </th>

                                <th className="px-4 py-3.5 font-semibold">
                                    Tipo
                                </th>

                                <th className="px-4 py-3.5 text-right font-semibold">
                                    Valor
                                </th>

                                <th className="px-4 py-3.5 font-semibold">
                                    Status
                                </th>

                                <th className="w-[64px] px-4 py-3.5" />
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((transaction) => {
                                const isInflow =
                                    transaction.type === "INFLOW";

                                const today = isToday(transaction.date);

                                return (
                                    <tr
                                        key={transaction.id}
                                        className="group border-b border-border/70 transition-colors last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${isInflow
                                                        ? "bg-emerald-500/10 text-emerald-600"
                                                        : "bg-red-500/10 text-red-600"
                                                        }`}
                                                >
                                                    {isInflow ? (
                                                        <ArrowDownLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="whitespace-nowrap font-medium">
                                                        {formatDate(
                                                            transaction.date
                                                        )}
                                                    </p>

                                                    {today && (
                                                        <span className="text-[10px] font-semibold text-[#053032]">
                                                            Hoje
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="min-w-[240px] px-4 py-4">
                                            <p className="truncate font-semibold text-foreground">
                                                {transaction.description ||
                                                    "Sem descrição"}
                                            </p>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {isInflow
                                                    ? "Entrada financeira"
                                                    : "Saída financeira"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                                                    style={{
                                                        backgroundColor:
                                                            transaction
                                                                .category
                                                                .color,
                                                    }}
                                                />

                                                <span className="whitespace-nowrap text-muted-foreground">
                                                    {
                                                        transaction
                                                            .category
                                                            .name
                                                    }
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`text-xs font-semibold ${isInflow
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                                    }`}
                                            >
                                                {isInflow
                                                    ? "Entrada"
                                                    : "Saída"}
                                            </span>
                                        </td>

                                        <td
                                            className={`whitespace-nowrap px-4 py-4 text-right font-bold ${isInflow
                                                ? "text-emerald-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {isInflow ? "+" : "−"}
                                            {formatBRL(
                                                transaction.value
                                            )}
                                        </td>

                                        <td className="px-4 py-4">
                                            <FinanceTransactionStatus
                                                status={
                                                    transaction.status
                                                }
                                            />
                                        </td>

                                        <td className="px-4 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-60 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    align="end"
                                                    sideOffset={6}
                                                    className="w-48 rounded-xl border border-border bg-white p-1.5 shadow-xl"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => onEdit(transaction)}
                                                        className="cursor-pointer rounded-lg px-3 py-2.5 font-medium text-foreground hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 dark:focus:bg-blue-950/30"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>

                                                    {transaction.status === "PENDING" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onStatusChange(transaction, "CONFIRMED")
                                                            }
                                                            className="cursor-pointer rounded-lg px-3 py-2.5 font-medium"
                                                        >
                                                            <Check className="mr-2 h-4 w-4 text-emerald-600" />
                                                            Marcar realizado
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator className="my-1.5" />

                                                    <DropdownMenuItem
                                                        className="cursor-pointer rounded-lg px-3 py-2.5 font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
                                                        onClick={() => onDelete(transaction)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Cancelar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t bg-muted/10 px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                        {transactions.length}{" "}
                        {transactions.length === 1
                            ? "lançamento"
                            : "lançamentos"}
                    </span>

                    <span className="hidden text-[11px] text-muted-foreground sm:block">
                        Clique em ⋯ para mais ações
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}