"use client";

import { useState } from "react";
import {
    Eye,
    EyeOff,
    Sparkles,
    Star,
    TrendingUp,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

import { RecommendationBadge } from "../../fii/components/recommendation-badge";
import { formatPct } from "@/src/lib/utils";

import type { Fund } from "@/src/types";

type StatusMudanca = "oportunidade" | "mudou";

interface MyFundsTableProps {
    funds: Fund[];
    walletTickers: Set<string>;
    watchlistTickers: Set<string>;
    activeList: "WALLET" | "WATCHLIST";
    mudancas: Record<string, StatusMudanca>;
    onSelect: (fund: Fund) => void;
    onToggle: (
        e: React.MouseEvent,
        papel: string,
        list: "WALLET" | "WATCHLIST"
    ) => void;
}

type SortKey = keyof Fund;

// Chip pequeno, ao lado do ticker — mesma ideia visual do
// RecommendationBadge, cores diferentes pra não confundir com recomendação.
function MudancaBadge({ status }: { status: StatusMudanca }) {
    if (status === "oportunidade") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <TrendingUp size={12} />
                Oportunidade
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <Sparkles size={12} />
            Mudou
        </span>
    );
}

function SortIcon({ active, desc }: { active: boolean; desc: boolean }) {
    if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return desc
        ? <ArrowDown className="h-3 w-3" />
        : <ArrowUp className="h-3 w-3" />;
}

export function MyFundsTable({
    funds,
    walletTickers,
    watchlistTickers,
    activeList,
    mudancas,
    onSelect,
    onToggle,
}: MyFundsTableProps) {
    const [sort, setSort] = useState<SortKey>("Rank");
    const [desc, setDesc] = useState(false);

    const toggle = (key: SortKey) => {
        if (sort === key) setDesc((d) => !d);
        else {
            setSort(key);
            setDesc(false);
        }
    };

    const sorted = [...funds].sort((a, b) => {
        const av = a[sort] as any;
        const bv = b[sort] as any;
        return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
    });

    const columns: { key: SortKey; label: string }[] = [
        { key: "Papel", label: "Fundo" },
        { key: "Segmento", label: "Segmento" },
        { key: "Dividend Yield", label: "DY" },
        { key: "P/VP", label: "P/VP" },
        { key: "Nota_Final", label: "Nota" },
        { key: "Recomendacao", label: "Recomendação" },
    ];

    return (
        <div className="scrollbar w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse border-spacing-0">
                <thead>
                    <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                        {columns.map(({ key, label }) => (
                            <th key={key} className="px-4 py-3 font-medium">
                                <button
                                    type="button"
                                    onClick={() => toggle(key)}
                                    className="inline-flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
                                >
                                    {label}
                                    <SortIcon active={sort === key} desc={desc} />
                                </button>
                            </th>
                        ))}
                        <th className="w-[120px] px-4 py-3 text-right font-medium">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sorted.map((fund) => {
                        const inWallet = walletTickers.has(fund.Papel);
                        const inWatchlist = watchlistTickers.has(fund.Papel);
                        const mudanca = mudancas[fund.Papel];

                        return (
                            <tr
                                key={fund.Papel}
                                onClick={() => onSelect(fund)}
                                className="w-full cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40 group/row"
                                style={{
                                    animation: "fadeSlideIn 200ms ease both",
                                    animationDelay: `${sorted.indexOf(fund) * 30}ms`,
                                }}
                            >
                                <td className="px-4 py-4 border-b border-border group-last/row:border-0">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">
                                                {fund.Papel}
                                            </p>
                                            {mudanca && <MudancaBadge status={mudanca} />}
                                        </div>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Rank #{fund.Rank}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-muted-foreground">
                                    {fund.Segmento || "—"}
                                </td>

                                <td className="number px-4 py-4">
                                    {formatPct(fund["Dividend Yield"])}
                                </td>

                                <td className="number px-4 py-4">
                                    {Number(fund["P/VP"] ?? 0).toFixed(2)}
                                </td>

                                <td className="number px-4 py-4 font-semibold">
                                    {Number(fund.Nota_Final ?? 0).toFixed(1)}
                                </td>

                                <td className="px-4 py-4">
                                    <RecommendationBadge
                                        value={fund.Recomendacao}
                                    />
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggle(e, fund.Papel, "WALLET");
                                            }}
                                            title={inWallet ? "Remover da carteira" : "Adicionar à carteira"}
                                            className="group flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-yellow-500/10"
                                        >
                                            <Star
                                                size={18}
                                                className={
                                                    inWallet
                                                        ? "fill-yellow-400 text-yellow-400 transition-colors"
                                                        : "text-muted-foreground/60 transition-colors group-hover:text-yellow-500"
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggle(e, fund.Papel, "WATCHLIST");
                                            }}
                                            title={inWatchlist ? "Remover da watchlist" : "Adicionar à watchlist"}
                                            className="group flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-blue-500/10"
                                        >
                                            {inWatchlist ? (
                                                <Eye
                                                    size={18}
                                                    className="text-blue-500 transition-colors"
                                                />
                                            ) : (
                                                <EyeOff
                                                    size={18}
                                                    className="text-muted-foreground/60 transition-colors group-hover:text-blue-500"
                                                />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}