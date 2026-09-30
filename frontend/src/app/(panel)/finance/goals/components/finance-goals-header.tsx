"use client";

import { Plus, Target } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface Props {
    onCreate: () => void;
}

export function FinanceGoalsHeader({ onCreate }: Props) {
    return (
        <header className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#053032]/10">
                        <Target className="h-4 w-4 text-[#053032]" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#053032]">
                        Financeiro
                    </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Metas
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Defina objetivos, acompanhe seu progresso e organize suas prioridades financeiras.
                </p>
            </div>

            <Button
                onClick={onCreate}
                className="h-10 shrink-0 gap-2 bg-[#0b6b68] px-4 text-sm font-medium hover:bg-[#095a57]"
            >
                <Plus className="h-4 w-4" />
                Nova meta
            </Button>
        </header>
    );
}
