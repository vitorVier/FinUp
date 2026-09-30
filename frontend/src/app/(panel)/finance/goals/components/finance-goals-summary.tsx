import { CircleCheck, CircleDollarSign, Flag, Target } from "lucide-react";
import type { Goal } from "@/src/app/(panel)/finance/types";
import { formatBRL } from "@/src/lib/utils";

interface Props {
    goals: Goal[];
}

export function FinanceGoalsSummary({ goals }: Props) {
    const active = goals.filter((goal) => goal.status === "ACTIVE").length;
    const completed = goals.filter((goal) => goal.status === "COMPLETED").length;
    const target = goals.reduce((sum, goal) => sum + Number(goal.targetValue), 0);
    const current = goals.reduce((sum, goal) => sum + Number(goal.currentValue), 0);
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

    const cards = [
        {
            label: "Metas ativas",
            value: String(active),
            helper: `${goals.length} metas cadastradas`,
            icon: Target,
            iconClass: "bg-[#053032]/10 text-[#053032]",
        },
        {
            label: "Valor acumulado",
            value: formatBRL(current),
            helper: "Total já direcionado",
            icon: CircleDollarSign,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Objetivo total",
            value: formatBRL(target),
            helper: `${progress.toFixed(0)}% do total alcançado`,
            icon: Flag,
            iconClass: "bg-sky-50 text-sky-600",
        },
        {
            label: "Concluídas",
            value: String(completed),
            helper: completed === 1 ? "Objetivo concluído" : "Objetivos concluídos",
            icon: CircleCheck,
            iconClass: "bg-violet-50 text-violet-600",
        },
    ];

    return (
        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, helper, icon: Icon, iconClass }) => (
                <div
                    key={label}
                    className="rounded-lg border border-border bg-card px-4 py-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                            <p className="mt-1 truncate text-lg font-semibold tracking-tight">{value}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground">{helper}</p>
                        </div>
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
