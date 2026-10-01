"use client";

import { useState } from "react";
import {
    Check,
    MoreHorizontal,
    Pencil,
    Trash2,
    ArrowDownLeft,
    ArrowUpRight,
    Repeat,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
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
} from "../../types";

interface Props {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    onStatusChange: (
        transaction: Transaction,
        status: TransactionStatus
    ) => void;
}

type SortKey = "date" | "description" | "category" | "type" | "value" | "paidAt" | "status";

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

function SortIcon({ active, desc }: { active: boolean; desc: boolean }) {
    if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return desc
        ? <ArrowDown className="h-3 w-3" />
        : <ArrowUp className="h-3 w-3" />;
}

function getSortValue(transaction: Transaction, key: SortKey): string | number {
    switch (key) {
        case "date":
            return transaction.date;
        case "description":
            return (transaction.description || "").toLowerCase();
        case "category":
            return transaction.category.name.toLowerCase();
        case "type":
            return transaction.type;
        case "value":
            return Number(transaction.value);
        case "paidAt":
            return transaction.paidAt ?? "";
        case "status":
            return transaction.status;
        default:
            return "";
    }
}

export function FinanceTransactionTable({
    transactions,
    onEdit,
    onDelete,
    onStatusChange,
}: Props) {
    const [sort, setSort] = useState<SortKey>("date");
    const [desc, setDesc] = useState(true);

    const toggle = (key: SortKey) => {
        if (sort === key) setDesc((d) => !d);
        else {
            setSort(key);
            setDesc(false);
        }
    };

    const sorted = [...transactions].sort((a, b) => {
        const av = getSortValue(a, sort);
        const bv = getSortValue(b, sort);
        return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
    });

    function ColHeader({
        label,
        sortKey,
        className = "",
    }: {
        label: string;
        sortKey: SortKey;
        className?: string;
    }) {
        const active = sort === sortKey;
        return (
            <th className={`px-4 py-3.5 font-semibold ${className}`}>
                <button
                    type="button"
                    onClick={() => toggle(sortKey)}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    {label}
                    <SortIcon active={active} desc={desc} />
                </button>
            </th>
        );
    }

    return (
        <Card className="overflow-hidden border-border shadow-sm">
            <CardContent className="!p-0">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[1000px] table-fixed text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                                <ColHeader label="Data" sortKey="date" className="px-5" />
                                <ColHeader label="Lançamento" sortKey="description" />
                                <ColHeader label="Categoria" sortKey="category" />
                                <ColHeader label="Tipo" sortKey="type" />
                                <th className="px-4 py-3.5 text-right font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => toggle("value")}
                                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                                    >
                                        Valor
                                        <SortIcon active={sort === "value"} desc={desc} />
                                    </button>
                                </th>
                                <ColHeader label="Pago em" sortKey="paidAt" />
                                <ColHeader label="Status" sortKey="status" />
                                <th className="w-[64px] px-4 py-3.5" />
                            </tr>
                        </thead>

                        <tbody>
                            {sorted.map((transaction) => {
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

                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                <p className="text-xs text-muted-foreground">
                                                    {isInflow
                                                        ? "Entrada financeira"
                                                        : "Saída financeira"}
                                                </p>

                                                {Boolean(
                                                    (
                                                        transaction as Transaction & {
                                                            recurrencyId?: string | null;
                                                        }
                                                    ).recurrencyId
                                                ) && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#053032]/8 px-1.5 py-0.5 text-[9px] font-medium text-[#053032]">
                                                            <Repeat className="h-2.5 w-2.5" />
                                                            Recorrente
                                                        </span>
                                                    )}
                                            </div>
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
                                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                                {transaction.paidAt ? formatDate(transaction.paidAt) : "-"}
                                            </span>
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
                        Clique no cabeçalho para ordenar
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}