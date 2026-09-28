"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FinanceTransactionsHeader } from "./components/finance-transaction-header";
import { FinanceTransactionSummary } from "./components/finance-transaction-summary";
import { FinanceTransactionFilters } from "./components/finance-transaction-filters";
import { FinanceTransactionTable } from "./components/finance-transaction-table";
import { FinanceTransactionDialog } from "./components/finance-transaction-dialog";
import { FinanceTransactionsEmpty } from "./components/finance-transaction-empty";

export type TransactionType = "INFLOW" | "OUTFLOW";
export type TransactionStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface TransactionCategory {
    id: string;
    name: string;
    color: string;
    type: TransactionType;
    icon: string;
    isActive: boolean;
}

export interface Transaction {
    id: string;
    userId: string;
    categoryId: string;
    recurrencyId?: string | null;
    value: string | number;
    description?: string | null;
    date: string;
    status: TransactionStatus;
    type: TransactionType;
    category: TransactionCategory;
}

export interface TransactionFormData {
    type: TransactionType;
    categoryId: string;
    value: string;
    description: string;
    date: string;
    status: TransactionStatus;
}

type FilterType = "ALL" | TransactionType;
type FilterStatus = "ALL" | TransactionStatus;

export default function LancamentosPage() {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterType, setFilterType] = useState<FilterType>("ALL");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const month = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

            const [inflowResponse, outflowResponse, categoriesInflowResponse, categoriesOutflowResponse] =
                await Promise.all([
                    fetch(`/api/finance/transaction?type=INFLOW&month=${month}`),
                    fetch(`/api/finance/transaction?type=OUTFLOW&month=${month}`),
                    fetch("/api/finance/inflow/categories"),
                    fetch("/api/finance/outflow/categories"),
                ]);

            if (
                !inflowResponse.ok ||
                !outflowResponse.ok ||
                !categoriesInflowResponse.ok ||
                !categoriesOutflowResponse.ok
            ) {
                throw new Error("Não foi possível carregar os lançamentos.");
            }

            const [inflows, outflows, categoriesInflowData, categoriesOutflowData] = await Promise.all([
                inflowResponse.json(),
                outflowResponse.json(),
                categoriesInflowResponse.json(),
                categoriesOutflowResponse.json(),
            ]);

            setTransactions([
                ...(Array.isArray(inflows) ? inflows : []),
                ...(Array.isArray(outflows) ? outflows : []),
            ]);

            setCategories([
                ...(Array.isArray(categoriesInflowData)
                    ? categoriesInflowData
                    : []),
                ...(Array.isArray(categoriesOutflowData)
                    ? categoriesOutflowData
                    : []),
            ]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao carregar os lançamentos."
            );
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...transactions]
            .filter(
                (transaction) =>
                    filterType === "ALL" ||
                    transaction.type === filterType
            )
            .filter(
                (transaction) =>
                    filterStatus === "ALL" ||
                    transaction.status === filterStatus
            )
            .filter(
                (transaction) =>
                    filterCategory === "ALL" ||
                    transaction.categoryId === filterCategory
            )
            .filter((transaction) => {
                if (!query) return true;

                return (
                    transaction.description
                        ?.toLowerCase()
                        .includes(query) ||
                    transaction.category.name
                        .toLowerCase()
                        .includes(query)
                );
            })
            .sort(
                (a, b) =>
                    new Date(b.date).getTime() -
                    new Date(a.date).getTime()
            );
    }, [
        transactions,
        filterType,
        filterStatus,
        filterCategory,
        search,
    ]);

    const summary = useMemo(() => {
        const confirmedInflows = transactions
            .filter(
                (item) =>
                    item.type === "INFLOW" &&
                    item.status === "CONFIRMED"
            )
            .reduce((total, item) => total + Number(item.value), 0);

        const confirmedOutflows = transactions
            .filter(
                (item) =>
                    item.type === "OUTFLOW" &&
                    item.status === "CONFIRMED"
            )
            .reduce((total, item) => total + Number(item.value), 0);

        const pendingInflows = transactions
            .filter(
                (item) =>
                    item.type === "INFLOW" &&
                    item.status === "PENDING"
            )
            .reduce((total, item) => total + Number(item.value), 0);

        const pendingOutflows = transactions
            .filter(
                (item) =>
                    item.type === "OUTFLOW" &&
                    item.status === "PENDING"
            )
            .reduce((total, item) => total + Number(item.value), 0);

        return {
            confirmedInflows,
            confirmedOutflows,
            pendingInflows,
            pendingOutflows,
            balance: confirmedInflows - confirmedOutflows,
            pending: pendingInflows + pendingOutflows,
        };
    }, [transactions]);

    const handleCreate = () => {
        setEditingTransaction(null);
        setDialogOpen(true);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setDialogOpen(true);
    };

    const handleSave = async (data: TransactionFormData) => {
        try {
            const isEditing = Boolean(editingTransaction);

            const url = isEditing
                ? `/api/finance/transaction/${editingTransaction!.id}`
                : `/api/finance/transaction?type=${data.type}`;

            const response = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    isEditing
                        ? "Não foi possível atualizar o lançamento."
                        : "Não foi possível criar o lançamento."
                );
            }

            setDialogOpen(false);
            setEditingTransaction(null);

            await loadData();

            toast.success(
                isEditing
                    ? "Lançamento atualizado."
                    : "Lançamento criado."
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Erro ao salvar lançamento."
            );
        }
    };

    const handleStatusChange = async (
        transaction: Transaction,
        status: TransactionStatus
    ) => {
        try {
            const response = await fetch(
                `/api/finance/transaction/${transaction.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Não foi possível atualizar o status.");
            }

            await loadData();

            toast.success("Status atualizado.");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Erro ao atualizar status."
            );
        }
    };

    const handleDelete = async (transaction: Transaction) => {
        const confirmed = window.confirm(
            `Deseja cancelar o lançamento "${transaction.description || "sem descrição"}"?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/finance/transaction/${transaction.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();
            if (!response.ok) {
                throw new Error("Não foi possível cancelar o lançamento.");
            }

            await loadData();

            toast.success("Lançamento cancelado.");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Erro ao cancelar lançamento."
            );
        }
    };

    return (
        <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <FinanceTransactionsHeader onCreate={handleCreate} />

            <FinanceTransactionSummary
                summary={summary}
                loading={loading}
            />

            <section className="mt-7">
                <FinanceTransactionFilters
                    search={search}
                    onSearchChange={setSearch}
                    type={filterType}
                    onTypeChange={setFilterType}
                    status={filterStatus}
                    onStatusChange={setFilterStatus}
                    category={filterCategory}
                    onCategoryChange={setFilterCategory}
                    categories={categories}
                    onCategoriesChange={setCategories}
                />
            </section>

            <section className="mt-5">
                {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        <div className="space-y-3 p-6">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div
                                    key={item}
                                    className="h-14 animate-pulse rounded-lg bg-muted"
                                />
                            ))}
                        </div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <FinanceTransactionsEmpty
                        hasFilters={
                            Boolean(search) ||
                            filterType !== "ALL" ||
                            filterStatus !== "ALL" ||
                            filterCategory !== "ALL"
                        }
                        onCreate={handleCreate}
                    />
                ) : (
                    <FinanceTransactionTable
                        transactions={filteredTransactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </section>

            <FinanceTransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                transaction={editingTransaction}
                categories={categories}
                onSave={handleSave}
                onCategoryCreated={(category) => {
                    setCategories((prev) => [...prev, category]);
                }}
            />
        </main>
    );
}