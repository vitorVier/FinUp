"use client";

import { CalendarDays, Pencil, Target, Trash2, CheckCircle2 } from "lucide-react";
import type { Goal } from "@/src/app/(panel)/finance/types";
import {
    formatGoalDate,
    getGoalProgress,
    getGoalRemaining,
    GOAL_PRIORITY_BG,
    GOAL_PRIORITY_BORDER,
    GOAL_PRIORITY_CLASS,
    GOAL_PRIORITY_COLORS,
    GOAL_PRIORITY_LABEL,
    GOAL_STATUS_CLASS,
    GOAL_STATUS_LABEL,
    GOAL_TYPE_LABEL,
} from "@/src/app/(panel)/finance/lib/goals";
import { Button } from "@/src/components/ui/button";
import { formatBRL } from "@/src/lib/utils";

interface Props {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
}

export function FinanceGoalCard({ goal, onEdit, onDelete }: Props) {
    const progress = getGoalProgress(goal);
    const color = GOAL_PRIORITY_COLORS[goal.priority];
    const remaining = getGoalRemaining(goal);

    return (
        <article
            className={`group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${GOAL_PRIORITY_BORDER[goal.priority]}`}
        >
            <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: color }}
            />
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}18`, color }}
                    >
                        <Target className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{goal.name}</h3>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {GOAL_TYPE_LABEL[goal.type]}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => onEdit(goal)}
                        title="Editar meta"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        onClick={() => onDelete(goal)}
                        title="Excluir meta"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${GOAL_STATUS_CLASS[goal.status]}`}>
                    {GOAL_STATUS_LABEL[goal.status]}
                </span>
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${GOAL_PRIORITY_BG[goal.priority]}`}
                >
                    Prioridade {GOAL_PRIORITY_LABEL[goal.priority].toLowerCase()}
                </span>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-[11px] text-muted-foreground">Progresso</p>
                        <p className="mt-0.5 text-sm font-semibold">
                            {formatBRL(Number(goal.currentValue))}
                            <span className="ml-1 font-normal text-muted-foreground">
                                de {formatBRL(Number(goal.targetValue))}
                            </span>
                        </p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color }}>
                        {progress.toFixed(0)}%
                    </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-3">
                <div>
                    <p className="text-[10px] text-muted-foreground">Falta</p>
                    <p className="mt-0.5 text-xs font-semibold">{formatBRL(remaining)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Meta mensal</p>
                    <p className="mt-0.5 text-xs font-semibold">{formatBRL(Number(goal.monthlyTarget))}</p>
                </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatGoalDate(goal.targetDate)}</span>
                </div>
                {goal.status === "COMPLETED" && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#0b6b68]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Concluída em {formatGoalDate(goal.updatedAt)}</span>
                    </div>
                )}
            </div>

            {goal.description && (
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {goal.description}
                </p>
            )}
        </article>
    );
}
