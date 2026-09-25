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
        <div className="mb-7">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Meus Fundos
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Gerencie seus fundos e acompanhe oportunidades de
                        interesse.
                    </p>
                </div>

                <div className="relative hidden w-full max-w-xs sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar fundo..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="relative mt-4 w-full sm:hidden">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar fundo..."
                    className="pl-9"
                />
            </div>
        </div>
    );
}