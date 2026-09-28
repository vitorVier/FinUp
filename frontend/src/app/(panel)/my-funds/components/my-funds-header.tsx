"use client";

import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface MyFundsHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export function MyFundsHeader({
    search,
    onSearchChange,
}: MyFundsHeaderProps) {
    return (
        <div className="mb-10 flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Meus Fundos
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Gerencie seus fundos e acompanhe oportunidades de interesse.
                </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar fundo..."
                    className="w-full pl-9"
                />
            </div>
        </div>
    );
}