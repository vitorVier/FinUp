"use client";

import {
    ArrowDownLeft,
    ArrowUpRight,
    Pencil,
    Plus,
    Search,
    Settings,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { FinanceMonthSelector } from "../../components/finance-month-selector";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";

import type {
    TransactionStatus,
    TransactionType,
} from "../page";
import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/src/components/ui/dialog";
import { TransactionCategory } from "../../types";

type FilterType = "ALL" | TransactionType;
type FilterStatus = "ALL" | TransactionStatus;

interface Props {
    search: string;
    onSearchChange: (value: string) => void;

    type: FilterType;
    onTypeChange: (value: FilterType) => void;

    status: FilterStatus;
    onStatusChange: (value: FilterStatus) => void;

    category: string;
    onCategoryChange: (value: string) => void;

    categories: TransactionCategory[];

    onCategoriesChange: (
        categories: TransactionCategory[]
    ) => void;

    year: number;
    month: number;
    onDateChange: (year: number, month: number) => void;
}

export function FinanceTransactionFilters({
    search,
    onSearchChange,
    type,
    onTypeChange,
    status,
    onStatusChange,
    category,
    onCategoryChange,
    categories,
    onCategoriesChange,
    year,
    month,
    onDateChange,
}: Props) {
    const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryType, setCategoryType] = useState<"INFLOW" | "OUTFLOW">("OUTFLOW");
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryTab, setCategoryTab] = useState<"ALL" | "INFLOW" | "OUTFLOW">("ALL");

    const hasFilters =
        Boolean(search) ||
        type !== "ALL" ||
        status !== "ALL" ||
        category !== "ALL";

    const activeFilterCount = [
        type !== "ALL",
        status !== "ALL",
        category !== "ALL",
    ].filter(Boolean).length;

    const clearFilters = () => {
        onSearchChange("");
        onTypeChange("ALL");
        onStatusChange("ALL");
        onCategoryChange("ALL");
    };

    const openCreateCategory = () => {
        setEditingCategory(null);
        setCategoryName("");
        setCategoryType("OUTFLOW");
        setCategoryDialogOpen(true);
    };

    const openEditCategory = (category: TransactionCategory) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setCategoryType(category.type);
        setCategoryDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        const name = categoryName.trim();

        if (!name) return;

        try {
            setCategoryLoading(true);

            const isEditing = !!editingCategory;

            const response = await fetch(
                isEditing
                    ? `/api/finance/categories/${editingCategory.id}`
                    : `/api/finance/${categoryType === "INFLOW"
                        ? "inflow"
                        : "outflow"
                    }/categories`,
                {
                    method: isEditing ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        isEditing
                            ? {
                                name,
                                icon:
                                    categoryType === "INFLOW"
                                        ? "ArrowDownLeft"
                                        : "ArrowUpRight",
                                color:
                                    categoryType === "INFLOW"
                                        ? "#16A34A"
                                        : "#DC2626",
                            }
                            : {
                                name,
                            }
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao salvar categoria.");
            }

            if (isEditing) {
                onCategoriesChange(
                    categories.map((item) =>
                        item.id === data.id ? data : item
                    )
                );
            } else {
                onCategoriesChange([
                    ...categories,
                    data,
                ]);
            }

            setCategoryDialogOpen(false);
            setEditingCategory(null);
            setCategoryName("");
        } catch (error) {
            console.error(error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Erro ao salvar categoria."
            );
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleDeleteCategory = async (
        categoryToDelete: TransactionCategory
    ) => {
        const confirmed = window.confirm(
            `Deseja realmente excluir a categoria "${categoryToDelete.name}"?`
        );

        if (!confirmed) return;

        try {
            setCategoryLoading(true);

            const response = await fetch(
                `/api/finance/categories/${categoryToDelete.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erro ao excluir categoria."
                );
            }

            onCategoriesChange(
                categories.filter(
                    (item) => item.id !== categoryToDelete.id
                )
            );

            if (category === categoryToDelete.id) {
                onCategoryChange("ALL");
            }
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Erro ao excluir categoria."
            );
        } finally {
            setCategoryLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#053032]/10">
                        <SlidersHorizontal className="h-4 w-4 text-[#053032]" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                                Filtros
                            </span>

                            {activeFilterCount > 0 && (
                                <span className="rounded-full bg-[#053032]/10 px-2 py-0.5 text-[10px] font-semibold text-[#053032]">
                                    {activeFilterCount} ativo
                                    {activeFilterCount > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            Refine os lançamentos exibidos
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FinanceMonthSelector
                        year={year}
                        month={month}
                        onChange={onDateChange}
                    />

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 w-fit gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            Limpar filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1 lg:min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar lançamento..."
                        className="h-10 w-full rounded-lg pl-9"
                    />
                </div>

                {/* Tipo */}
                <Select
                    value={type}
                    onValueChange={(value) =>
                        onTypeChange(value as FilterType)
                    }
                >
                    <SelectTrigger className="h-10 w-full rounded-lg lg:w-[150px]">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ALL">
                            Todos os tipos
                        </SelectItem>
                        <SelectItem value="INFLOW">
                            Entradas
                        </SelectItem>
                        <SelectItem value="OUTFLOW">
                            Saídas
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Status */}
                <Select
                    value={status}
                    onValueChange={(value) =>
                        onStatusChange(value as FilterStatus)
                    }
                >
                    <SelectTrigger className="h-10 w-full rounded-lg lg:w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ALL">
                            Todos os status
                        </SelectItem>
                        <SelectItem value="CONFIRMED">
                            Realizados
                        </SelectItem>
                        <SelectItem value="PENDING">
                            Pendentes
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                            Cancelados
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Categoria */}
                <Select
                    value={category}
                    onValueChange={onCategoryChange}
                >
                    <SelectTrigger className="h-10 w-full rounded-lg lg:w-[180px]">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="ALL">
                            Todas as categorias
                        </SelectItem>

                        {categories
                            .filter(
                                (item) =>
                                    item.isActive &&
                                    (categoryTab === "ALL" || item.type === categoryTab)
                            )
                            .map((item) => (
                                <SelectItem
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>

                {/* Configurações */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setManageCategoriesOpen(true)}
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            <Dialog
                open={manageCategoriesOpen}
                onOpenChange={setManageCategoriesOpen}
            >
                <DialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
                    <DialogHeader className="border-b border-border/70 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#053032]/10">
                                <Settings className="h-4 w-4 text-[#053032]" />
                            </div>

                            <div className="min-w-0">
                                <DialogTitle className="text-base font-semibold">
                                    Gerenciar categorias
                                </DialogTitle>

                                <DialogDescription className="mt-0.5 text-xs">
                                    Organize as categorias usadas nos seus lançamentos.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="border-b border-border/70 px-5 py-3">
                        <div className="grid grid-cols-3 rounded-lg bg-muted/50 p-1">
                            <button
                                type="button"
                                onClick={() => setCategoryTab("ALL")}
                                className={`h-8 rounded-md text-xs font-medium transition-all ${categoryTab === "ALL"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Todas
                            </button>

                            <button
                                type="button"
                                onClick={() => setCategoryTab("INFLOW")}
                                className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${categoryTab === "INFLOW"
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                Entradas
                            </button>

                            <button
                                type="button"
                                onClick={() => setCategoryTab("OUTFLOW")}
                                className={`flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${categoryTab === "OUTFLOW"
                                    ? "bg-red-50 text-red-700 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Saídas
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto px-5 py-4">
                        {categories.filter(
                            (item) =>
                                item.isActive &&
                                (categoryTab === "ALL" || item.type === categoryTab)
                        ).length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 py-12 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <p className="mt-3 text-sm font-medium">
                                    Nenhuma categoria cadastrada
                                </p>

                                <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                                    Crie uma categoria para começar a organizar seus
                                    lançamentos.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories
                                    .filter(
                                        (item) =>
                                            item.isActive &&
                                            (categoryTab === "ALL" || item.type === categoryTab)
                                    )
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center justify-between rounded-xl border border-border/70 bg-card px-3.5 py-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                                    style={{
                                                        backgroundColor: `${item.color}18`,
                                                    }}
                                                >
                                                    {item.type === "INFLOW" ? (
                                                        <ArrowDownLeft
                                                            className="h-4 w-4"
                                                            style={{
                                                                color: item.color,
                                                            }}
                                                        />
                                                    ) : (
                                                        <ArrowUpRight
                                                            className="h-4 w-4"
                                                            style={{
                                                                color: item.color,
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.name}
                                                    </p>

                                                    <div className="mt-0.5 flex items-center gap-1.5">
                                                        <span
                                                            className={`text-[11px] font-medium ${item.type === "INFLOW"
                                                                ? "text-emerald-600"
                                                                : "text-red-600"
                                                                }`}
                                                        >
                                                            {item.type === "INFLOW"
                                                                ? "Entrada"
                                                                : "Saída"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-3 flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    onClick={() =>
                                                        openEditCategory(item)
                                                    }
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                    onClick={() =>
                                                        handleDeleteCategory(item)
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-border/70 bg-muted/20 px-5 py-3.5">
                        <Button
                            className="h-9 gap-2 bg-[#053032] px-3.5 text-xs hover:bg-[#053032]/90"
                            onClick={openCreateCategory}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Nova categoria
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
            >
                <DialogContent className="overflow-hidden p-0 sm:max-w-[420px]">
                    <DialogHeader className="border-b border-border/70 px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#053032]/10">
                                {editingCategory ? (
                                    <Pencil className="h-4 w-4 text-[#053032]" />
                                ) : (
                                    <Plus className="h-4 w-4 text-[#053032]" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <DialogTitle className="text-base font-semibold">
                                    {editingCategory
                                        ? "Editar categoria"
                                        : "Nova categoria"}
                                </DialogTitle>

                                <DialogDescription className="mt-0.5 text-xs">
                                    {editingCategory
                                        ? "Atualize as informações da categoria."
                                        : "Defina o nome e o tipo da nova categoria."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5 px-5 py-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                                Nome da categoria
                            </label>

                            <Input
                                value={categoryName}
                                onChange={(e) =>
                                    setCategoryName(e.target.value)
                                }
                                placeholder="Ex.: Alimentação"
                                autoFocus
                                maxLength={50}
                                className="h-10 rounded-lg"
                                disabled={categoryLoading}
                            />

                            <p className="text-[10px] text-muted-foreground">
                                Escolha um nome curto e fácil de identificar.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                                Tipo
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={!!editingCategory || categoryLoading}
                                    onClick={() =>
                                        setCategoryType("INFLOW")
                                    }
                                    className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-all ${categoryType === "INFLOW"
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        } ${editingCategory
                                            ? "cursor-not-allowed opacity-60"
                                            : ""
                                        }`}
                                >
                                    <ArrowDownLeft className="h-4 w-4" />
                                    Entrada
                                </button>

                                <button
                                    type="button"
                                    disabled={!!editingCategory || categoryLoading}
                                    onClick={() =>
                                        setCategoryType("OUTFLOW")
                                    }
                                    className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-all ${categoryType === "OUTFLOW"
                                        ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        } ${editingCategory
                                            ? "cursor-not-allowed opacity-60"
                                            : ""
                                        }`}
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                    Saída
                                </button>
                            </div>

                            {editingCategory && (
                                <p className="rounded-lg bg-muted/50 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
                                    O tipo da categoria não pode ser alterado após
                                    sua criação.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border/70 bg-muted/20 px-5 py-3.5">
                        <Button
                            variant="ghost"
                            className="h-9 text-xs text-muted-foreground"
                            onClick={() =>
                                setCategoryDialogOpen(false)
                            }
                            disabled={categoryLoading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleSaveCategory}
                            disabled={
                                categoryLoading ||
                                !categoryName.trim()
                            }
                            className="h-9 bg-[#053032] px-4 text-xs hover:bg-[#053032]/90"
                        >
                            {categoryLoading
                                ? "Salvando..."
                                : editingCategory
                                    ? "Salvar alterações"
                                    : "Criar categoria"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}