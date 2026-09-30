import type { Goal, GoalStatus, GoalType, GoalPriority } from "@/src/app/(panel)/finance/types";

export const GOAL_TYPE_LABEL: Record<GoalType, string> = {
    SAVING: "Poupança",
    INVESTMENT: "Investimento",
    PURCHASE: "Compra",
    TRAVEL: "Viagem",
    EMERGENCY: "Reserva de emergência",
    DEBT: "Dívida",
    OTHER: "Outro",
};

export const GOAL_STATUS_LABEL: Record<GoalStatus, string> = {
    ACTIVE: "Ativa",
    COMPLETED: "Concluída",
    PAUSED: "Pausada",
    CANCELLED: "Cancelada",
};

export const GOAL_PRIORITY_COLORS: Record<GoalPriority, string> = {
    LOW: "#0b6b68",
    MEDIUM: "#d97706",
    HIGH: "#dc2626",
};

export const GOAL_PRIORITY_BG: Record<GoalPriority, string> = {
    LOW: "bg-[#0b6b68]/10 text-[#0b6b68]",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
};

export const GOAL_PRIORITY_BORDER: Record<GoalPriority, string> = {
    LOW: "border-[#0b6b68]/30",
    MEDIUM: "border-amber-300",
    HIGH: "border-red-300",
};

export const GOAL_PRIORITY_LABEL: Record<GoalPriority, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
};

export const GOAL_STATUS_CLASS: Record<GoalStatus, string> = {
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
    COMPLETED: "border-sky-200 bg-sky-50 text-sky-700",
    PAUSED: "border-amber-200 bg-amber-50 text-amber-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

export const GOAL_PRIORITY_CLASS: Record<GoalPriority, string> = {
    LOW: "bg-muted text-muted-foreground",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
};

export function getGoalProgress(goal: Goal) {
    const target = Number(goal.targetValue) || 0;
    const current = Number(goal.currentValue) || 0;
    if (!target) return 0;
    return Math.min(100, Math.max(0, (current / target) * 100));
}

export function getGoalRemaining(goal: Goal) {
    return Math.max(0, Number(goal.targetValue) - Number(goal.currentValue));
}

export function formatGoalDate(value?: string | null) {
    if (!value) return "Sem prazo definido";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sem prazo definido";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}
