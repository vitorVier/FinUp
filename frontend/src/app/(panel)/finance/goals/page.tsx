"use client";

import { useMemo, useState } from "react";
import { AlertCircle, RotateCcw, Search, Target } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { useGoals } from "@/src/app/(panel)/finance/hooks/use-goals";
import type { Goal, GoalPriority, GoalStatus, GoalType } from "@/src/app/(panel)/finance/types";
import { GOAL_PRIORITY_LABEL, GOAL_STATUS_LABEL, GOAL_TYPE_LABEL } from "@/src/app/(panel)/finance/lib/goals";

import { FinanceGoalsHeader } from "./components/finance-goals-header";
import { FinanceGoalsSummary } from "./components/finance-goals-summary";
import { FinanceGoalCard } from "./components/finance-goal-card";
import { FinanceGoalDialog } from "./components/finance-goal-dialog";
import type { GoalFormData } from "@/src/app/(panel)/finance/types";

export default function MetasPage() {
    const { goals, loading, error, reload, createGoal, updateGoal, deleteGoal } = useGoals();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<"ALL" | GoalStatus>("ALL");
    const [type, setType] = useState<"ALL" | GoalType>("ALL");
    const [priority, setPriority] = useState<"ALL" | GoalPriority>("ALL");
    const [sortBy, setSortBy] = useState<
        "PRIORITY_DESC" | "PRIORITY_ASC" | "PROGRESS_DESC" | "PROGRESS_ASC"
    >("PRIORITY_DESC");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const filteredGoals = useMemo(() => {
        const query = search.trim().toLowerCase();
        const priorityOrder: Record<GoalPriority, number> = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
        };

        return goals
            .filter((goal) => status === "ALL" || goal.status === status)
            .filter((goal) => type === "ALL" || goal.type === type)
            .filter((goal) => priority === "ALL" || goal.priority === priority)
            .filter((goal) => {
                if (!query) return true;

                return (
                    goal.name.toLowerCase().includes(query) ||
                    goal.description?.toLowerCase().includes(query) ||
                    GOAL_TYPE_LABEL[goal.type].toLowerCase().includes(query)
                );
            })
            .sort((a, b) => {
                if (sortBy.startsWith("PRIORITY")) {
                    const diff =
                        priorityOrder[b.priority] - priorityOrder[a.priority];

                    return sortBy === "PRIORITY_DESC" ? diff : -diff;
                }

                const progressA =
                    Number(a.targetValue) > 0
                        ? (Number(a.currentValue) / Number(a.targetValue)) * 100
                        : 0;

                const progressB =
                    Number(b.targetValue) > 0
                        ? (Number(b.currentValue) / Number(b.targetValue)) * 100
                        : 0;

                const diff = progressB - progressA;

                return sortBy === "PROGRESS_DESC" ? diff : -diff;
            });
    }, [goals, search, status, type, priority, sortBy]);

    const handleCreate = () => {
        setEditingGoal(null);
        setDialogOpen(true);
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setDialogOpen(true);
    };

    const handleSave = async (data: GoalFormData) => {
        if (editingGoal) {
            await updateGoal(editingGoal, data);
        } else {
            await createGoal(data);
        }
    };

    const handleDelete = async (goal: Goal) => {
        const confirmed = window.confirm(
            `Deseja realmente excluir a meta "${goal.name}"? Essa ação não pode ser desfeita.`
        );
        if (!confirmed) return;

        try {
            await deleteGoal(goal);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Erro ao excluir a meta.");
        }
    };

    const hasFilters = Boolean(search) || status !== "ALL" || type !== "ALL" || priority !== "ALL";

    const clearFilters = () => {
        setSearch("");
        setStatus("ALL");
        setType("ALL");
        setPriority("ALL");
    };

    return (
        <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <FinanceGoalsHeader onCreate={handleCreate} />

            <FinanceGoalsSummary goals={goals} />

            <section className="mt-7 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#053032]/10">
                            <Target className="h-4 w-4 text-[#053032]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Minhas metas</p>
                            <p className="text-[11px] text-muted-foreground">
                                Acompanhe cada objetivo em um só lugar
                            </p>
                        </div>
                    </div>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 w-fit text-xs text-muted-foreground"
                        >
                            Limpar filtros
                        </Button>
                    )}
                </div>

                <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(260px,1fr)_160px_180px_160px_220px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar meta..."
                            className="h-10 rounded-lg pl-9"
                        />
                    </div>

                    <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                        <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os status</SelectItem>
                            {Object.entries(GOAL_STATUS_LABEL).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                        <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os tipos</SelectItem>
                            {Object.entries(GOAL_TYPE_LABEL).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
                        <SelectTrigger className="h-10 rounded-lg text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas as prioridades</SelectItem>
                            {Object.entries(GOAL_PRIORITY_LABEL).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortBy}
                        onValueChange={(value) =>
                            setSortBy(value as typeof sortBy)
                        }
                    >
                        <SelectTrigger className="h-10 rounded-lg text-xs">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>

                        <SelectContent className="text-xs">
                            <SelectItem value="PRIORITY_DESC" className="flex gap-5 text-xs">
                                Prioridade: Alta primeiro
                            </SelectItem>

                            <SelectItem value="PRIORITY_ASC" className="text-xs flex gap-4">
                                Prioridade: Baixa primeiro
                            </SelectItem>

                            <SelectItem value="PROGRESS_DESC" className="text-xs flex gap-4 ">
                                Progresso: Maior primeiro
                            </SelectItem>

                            <SelectItem value="PROGRESS_ASC" className="text-xs flex gap-4">
                                Progresso: Menor primeiro
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {error ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="mt-3 text-sm font-medium">Não foi possível carregar suas metas</p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={reload}
                            className="mt-4 h-9 gap-2 text-xs"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Tentar novamente
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-[280px] animate-pulse rounded-xl border border-border bg-muted/30" />
                        ))}
                    </div>
                ) : filteredGoals.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#053032]/10">
                            <Target className="h-5 w-5 text-[#053032]" />
                        </div>
                        <p className="mt-4 text-sm font-medium">
                            {goals.length === 0 ? "Você ainda não possui metas" : "Nenhuma meta encontrada"}
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                            {goals.length === 0
                                ? "Crie seu primeiro objetivo financeiro para começar a acompanhar seu progresso."
                                : "Ajuste os filtros ou a busca para encontrar outra meta."}
                        </p>
                        {goals.length === 0 ? (
                            <Button
                                onClick={handleCreate}
                                className="mt-5 h-9 gap-2 bg-[#053032] text-xs hover:bg-[#053032]/90"
                            >
                                <Target className="h-3.5 w-3.5" />
                                Criar primeira meta
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="mt-5 h-9 text-xs"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredGoals.map((goal) => (
                            <FinanceGoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredGoals.length > 0 && (
                    <div className="border-t border-border px-4 py-3 text-[10px] text-muted-foreground sm:px-5">
                        {filteredGoals.length} {filteredGoals.length === 1 ? "meta exibida" : "metas exibidas"}
                    </div>
                )}
            </section>

            <FinanceGoalDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingGoal(null);
                }}
                goal={editingGoal}
                onSave={handleSave}
            />
        </main>
    );
}
