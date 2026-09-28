"use client";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface FinanceMonthSelectorProps {
    year: number;
    month: number;
    onChange: (year: number, month: number) => void;
}

const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export function FinanceMonthSelector({
    year,
    month,
    onChange,
}: FinanceMonthSelectorProps) {
    const previousMonth = () => {
        const date = new Date(year, month - 1, 1);

        onChange(
            date.getFullYear(),
            date.getMonth()
        );
    };

    const nextMonth = () => {
        const date = new Date(year, month + 1, 1);

        onChange(
            date.getFullYear(),
            date.getMonth()
        );
    };

    const goToCurrentMonth = () => {
        const now = new Date();

        onChange(
            now.getFullYear(),
            now.getMonth()
        );
    };

    const now = new Date();

    const isCurrentMonth =
        year === now.getFullYear() &&
        month === now.getMonth();

    return (
        <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={previousMonth}
                title="Mês anterior"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <button
                type="button"
                onClick={goToCurrentMonth}
                className="flex min-w-[145px] items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
                <CalendarDays className="h-4 w-4 text-[#053032]" />

                <span>
                    {MONTHS[month]} {year}
                </span>
            </button>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={nextMonth}
                title="Próximo mês"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {!isCurrentMonth && (
                <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="mr-1 hidden rounded-md px-2 py-1 text-[11px] font-medium text-[#053032] transition-colors hover:bg-[#053032]/5 sm:block"
                >
                    Hoje
                </button>
            )}
        </div>
    );
}