"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    CircleDollarSign,
    FileText,
    Plus,
    Repeat,
    Tag,
} from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";

import type {
    Transaction,
    TransactionCategory,
    TransactionStatus,
    TransactionType,
} from "../../types";
import { TransactionFormData } from "../page";
import { formatInputCurrency, toNumber } from "../../utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
    categories: TransactionCategory[];
    onSave: (data: TransactionFormData) => Promise<void>;
    onCategoryCreated: (category: TransactionCategory) => void;
}

function today() {
    return new Date().toISOString().split("T")[0];
}

export function FinanceTransactionDialog({
    open,
    onOpenChange,
    transaction,
    categories,
    onSave,
    onCategoryCreated,
}: Props) {
    const [type, setType] = useState<TransactionType>("OUTFLOW");

    const [categoryId, setCategoryId] = useState("");
    const [value, setValue] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(today());

    const [status, setStatus] = useState<TransactionStatus>("PENDING");
    const [isRecurring, setIsRecurring] = useState(false);
    const [saving, setSaving] = useState(false);

    // Nova categoria
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    const isInflow = type === "INFLOW";
    const endpoint = isInflow
        ? "/api/finance/inflow/categories"
        : "/api/finance/outflow/categories";

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setCategoryId(transaction.categoryId);
            setValue(
                toNumber(transaction.value)
                    .toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })
            );
            setDescription(transaction.description ?? "");
            setDate(transaction.date.slice(0, 10));
            setStatus(transaction.status);
            setIsRecurring(false);
        } else {
            setType("OUTFLOW");
            setCategoryId("");
            setValue("");
            setDescription("");
            setDate(today());
            setStatus("PENDING");
            setIsRecurring(false);
        }
    }, [transaction, open]);

    const availableCategories = useMemo(
        () =>
            categories.filter(
                (category) =>
                    category.isActive &&
                    category.type === type
            ),
        [categories, type]
    );

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!categoryId || !value || !date) return;

        try {
            setSaving(true);

            await onSave({
                type,
                categoryId,
                value: parseInputCurrency(value),
                description,
                date,
                status,
                recurring: isRecurring,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();

        if (!name) {
            toast.error("Informe o nome da categoria.");
            return;
        }

        const alreadyExists = categories.some(
            (category) =>
                category.type === type &&
                category.name.trim().toLowerCase() ===
                name.toLowerCase() &&
                category.isActive
        );

        if (alreadyExists) {
            toast.error("Essa categoria já existe.");
            return;
        }

        try {
            setCreatingCategory(true);

            const response = await fetch(
                endpoint,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    "Não foi possível criar a categoria."
                );
            }

            const createdCategory = data.category ?? data;

            onCategoryCreated(createdCategory);
            setCategoryId(createdCategory.id);
            setNewCategoryName("");
            setCategoryDialogOpen(false);

            toast.success(
                `Categoria "${createdCategory.name}" criada.`
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Erro ao criar categoria."
            );
        } finally {
            setCreatingCategory(false);
        }
    };

    function parseInputCurrency(value: string): string {
        const digits = value.replace(/\D/g, "");

        if (!digits) {
            return "0.00";
        }

        return (Number(digits) / 100).toFixed(2);
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(value) => {
                    if (!value) {
                        setCategoryDialogOpen(false);
                        setNewCategoryName("");
                    }

                    onOpenChange(value);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl p-0">
                    <div
                        className={`h-1.5 w-full ${isInflow
                            ? "bg-emerald-500"
                            : "bg-red-500"
                            }`}
                    />

                    <div className="p-6">
                        <DialogHeader className="text-left">
                            <div className="mb-3 -mx-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#053032]/10">
                                <CircleDollarSign className="h-5 w-5 text-[#053032]" />
                            </div>

                            <DialogTitle className="text-xl -mx-5">
                                {transaction
                                    ? "Editar lançamento"
                                    : "Novo lançamento"}
                            </DialogTitle>

                            <DialogDescription className="-mx-5">
                                Registre os detalhes da movimentação
                                financeira.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5"
                        >
                            {/* TIPO */}
                            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setType("OUTFLOW");
                                        setCategoryId("");
                                    }}
                                    className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${type === "OUTFLOW"
                                        ? "bg-white text-red-600 shadow-sm dark:bg-background"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                    Saída
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setType("INFLOW");
                                        setCategoryId("");
                                    }}
                                    className={`flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all ${type === "INFLOW"
                                        ? "bg-white text-emerald-600 shadow-sm dark:bg-background"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <ArrowDownLeft className="h-4 w-4" />
                                    Entrada
                                </button>
                            </div>

                            {/* VALOR / DATA */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <CircleDollarSign className="h-3.5 w-3.5" />
                                        Valor
                                    </label>

                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={value || "0,00"}
                                        onChange={(event) => {
                                            setValue(formatInputCurrency(event.target.value));
                                        }}
                                        onFocus={(event) => {
                                            event.target.select();
                                        }}
                                        required
                                        className="h-11 rounded-lg text-base font-semibold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Data
                                    </label>

                                    <Input
                                        type="date"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(
                                                event.target.value
                                            )
                                        }
                                        required
                                        className="h-11 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* DESCRIÇÃO */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5" />
                                    Descrição
                                </label>

                                <Input
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex.: Salário, supermercado..."
                                    className="h-11 rounded-lg"
                                />
                            </div>

                            {/* CATEGORIA / STATUS */}
                            <div className="grid gap-4 sm:grid-cols-2 items-end">
                                {/* CATEGORIA */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5" />
                                        Categoria
                                    </label>

                                    <Select
                                        value={categoryId}
                                        onValueChange={(value) => {
                                            if (value === "__new_category__") {
                                                setCategoryDialogOpen(true);
                                                return;
                                            }
                                            setCategoryId(value);
                                        }}
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-lg">
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {availableCategories.map(
                                                (category) => (
                                                    <SelectItem
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                )
                                            )}

                                            <SelectItem value="__new_category__">
                                                <span className="flex items-center gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Nova categoria
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* STATUS */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Status
                                    </label>

                                    <Select
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value as TransactionStatus
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="PENDING">
                                                Previsto
                                            </SelectItem>

                                            <SelectItem value="CONFIRMED">
                                                Realizado
                                            </SelectItem>

                                            <SelectItem value="CANCELLED">
                                                Cancelado
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* RECORRÊNCIA */}
                            {!transaction ? (
                                <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isRecurring}
                                            onChange={(event) =>
                                                setIsRecurring(event.target.checked)
                                            }
                                            disabled={saving}
                                            className="mt-0.5 h-4 w-4 shrink-0 accent-[#053032]"
                                        />

                                        <span className="min-w-0">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Repeat className="h-3.5 w-3.5 text-[#053032]" />
                                                Tornar lançamento recorrente
                                            </span>

                                            <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                                                Repetir automaticamente todos os meses no dia{" "}
                                                {date
                                                    ? Number(date.slice(8, 10))
                                                    : "definido pela data"}.
                                            </span>
                                        </span>
                                    </label>

                                    {isRecurring && (
                                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-background px-3 py-2.5 text-[11px] text-muted-foreground">
                                            <Repeat className="h-3.5 w-3.5 shrink-0 text-[#053032]" />

                                            <span>
                                                Os próximos lançamentos serão gerados
                                                automaticamente como{" "}
                                                <strong className="font-semibold text-foreground">
                                                    Previstos
                                                </strong>
                                                .
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                Boolean(
                                    (
                                        transaction as Transaction & {
                                            recurrencyId?: string | null;
                                        }
                                    ).recurrencyId
                                ) && (
                                    <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
                                        <Repeat className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#053032]" />

                                        <span>
                                            Este lançamento pertence a uma recorrência.
                                            Alterações aqui afetam apenas este lançamento.
                                        </span>
                                    </div>
                                )
                            )}

                            {/* AÇÕES */}
                            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        onOpenChange(false)
                                    }
                                    className="h-10 rounded-lg"
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !categoryId ||
                                        !value ||
                                        !date
                                    }
                                    className="h-10 rounded-lg bg-[#053032] px-5 hover:bg-[#0c4441]"
                                >
                                    {saving
                                        ? "Salvando..."
                                        : transaction
                                            ? "Salvar alterações"
                                            : "Adicionar lançamento"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* NOVA CATEGORIA */}
            <Dialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
            >
                <DialogContent
                    className="
                    w-[calc(100%-2rem)]
                    max-w-md
                    overflow-hidden
                    rounded-2xl
                    border
                    bg-background
                    p-0
                    shadow-2xl
                "
                >
                    {/* Header */}
                    <div className="pt-6">
                        <DialogHeader className="space-y-2 text-left">
                            <div className="flex items-start justify-between">
                                <div
                                    className="
                                        flex h-11 w-11 items-center justify-center
                                        rounded-xl
                                        bg-[#053032]/8
                                        ring-1 ring-[#053032]/10
                                    "
                                >
                                    <Tag className="h-5 w-5 text-[#053032]" />
                                </div>
                            </div>

                            <div>
                                <DialogTitle className="text-lg font-semibold tracking-tight">
                                    Nova categoria
                                </DialogTitle>

                                <DialogDescription className="max-w-sm text-sm leading-5">
                                    Crie uma categoria de{" "}
                                    <span
                                        className={
                                            isInflow
                                                ? "font-medium text-emerald-600"
                                                : "font-medium text-red-600"
                                        }
                                    >
                                        {isInflow ? "entrada" : "saída"}
                                    </span>{" "}
                                    sem sair do lançamento.
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Conteúdo */}
                    <div className="px-6 pb-5 pt-1">
                        <div className="space-y-1">
                            <label
                                htmlFor="new-category-name"
                                className="text-sm font-medium text-foreground"
                            >
                                Nome da categoria
                            </label>

                            <Input
                                id="new-category-name"
                                autoFocus
                                value={newCategoryName}
                                onChange={(event) =>
                                    setNewCategoryName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        newCategoryName.trim() &&
                                        !creatingCategory
                                    ) {
                                        event.preventDefault();
                                        handleCreateCategory();
                                    }
                                }}
                                placeholder={
                                    isInflow
                                        ? "Ex.: Salário, Freelance..."
                                        : "Ex.: Alimentação, Transporte..."
                                }
                                maxLength={50}
                                disabled={creatingCategory}
                                className="
                                    h-11
                                    rounded-lg
                                    border-border
                                    bg-background
                                    px-3.5
                                    text-sm
                                    shadow-sm
                                    transition
                                    placeholder:text-muted-foreground/60
                                    focus-visible:border-[#053032]
                                    focus-visible:ring-[#053032]/15
                                "
                            />

                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-muted-foreground">
                                    Escolha um nome simples e fácil de identificar.
                                </p>

                                <span className="text-[11px] text-muted-foreground">
                                    {newCategoryName.length}/50
                                </span>
                            </div>
                        </div>

                        {/* Tipo da categoria */}
                        <div
                            className="
                                mt-5
                                flex items-center justify-between
                                rounded-lg
                                border
                                bg-muted/30
                                px-3.5
                                py-3
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                                        flex h-8 w-8 items-center justify-center
                                        rounded-lg
                                        ${isInflow
                                            ? "bg-emerald-500/10 text-emerald-600"
                                            : "bg-red-500/10 text-red-600"
                                        }
                                    `}
                                >
                                    {isInflow ? (
                                        <ArrowDownLeft className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4" />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Tipo
                                    </p>

                                    <p className="text-sm font-semibold">
                                        {isInflow ? "Entrada" : "Saída"}
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-[11px]
                                    font-semibold
                                    ${isInflow
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-red-500/10 text-red-600"
                                    }
                                `}
                            >
                                {isInflow ? "Receita" : "Despesa"}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="
                            flex items-center justify-end
                            gap-2
                            border-t
                            bg-muted/20
                            px-6
                            py-4
                        "
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={creatingCategory}
                            onClick={() => {
                                setCategoryDialogOpen(false);
                                setNewCategoryName("");
                            }}
                            className="
                                h-10
                                rounded-lg
                                px-4
                                text-sm
                                font-medium
                                hover:bg-muted
                            "
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            disabled={
                                creatingCategory ||
                                !newCategoryName.trim()
                            }
                            onClick={handleCreateCategory}
                            className="
                                h-10
                                rounded-lg
                                bg-[#053032]
                                px-5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition-all
                                hover:bg-[#0c4441]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {creatingCategory ? (
                                <>
                                    <span
                                        className="
                                mr-2
                                h-3.5
                                w-3.5
                                animate-spin
                                rounded-full
                                border-2
                                border-white/30
                                border-t-white
                            "
                                    />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Criar categoria
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}