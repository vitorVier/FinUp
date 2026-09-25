"use client";

import { Eye, EyeOff, Star } from "lucide-react";

import { RecommendationBadge } from "@/src/components/fii/recommendation-badge";
import { formatPct } from "@/src/lib/utils";

import type { Fund } from "@/src/types";

interface MyFundsTableProps {
    funds: Fund[];
    walletTickers: Set<string>;
    watchlistTickers: Set<string>;
    activeList: "WALLET" | "WATCHLIST";
    onSelect: (fund: Fund) => void;
    onToggle: (
        e: React.MouseEvent,
        papel: string,
        list: "WALLET" | "WATCHLIST"
    ) => void;
}

export function MyFundsTable({
    funds,
    walletTickers,
    watchlistTickers,
    activeList,
    onSelect,
    onToggle,
}: MyFundsTableProps) {
    return (
        <div className="scrollbar w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse border-spacing-0">
                <thead>
                    <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Fundo</th>
                        <th className="px-4 py-3 font-medium">Segmento</th>
                        <th className="px-4 py-3 font-medium">DY</th>
                        <th className="px-4 py-3 font-medium">P/VP</th>
                        <th className="px-4 py-3 font-medium">Nota</th>
                        <th className="px-4 py-3 font-medium">
                            Recomendação
                        </th>
                        <th className="w-[120px] px-4 py-3 text-right font-medium">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {funds.map((fund) => {
                        const inWallet = walletTickers.has(fund.Papel);
                        const inWatchlist = watchlistTickers.has(fund.Papel);

                        return (
                            <tr
                                key={fund.Papel}
                                onClick={() => onSelect(fund)}
                                className="w-full cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40 group/row"
                                style={{
                                    animation: "fadeSlideIn 200ms ease both",
                                    animationDelay: `${funds.indexOf(fund) * 30}ms`,
                                }}
                            >
                                <td className="px-5 py-4 border-b border-border group-last/row:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                                            {fund.Papel.slice(0, 2)}
                                        </div>

                                        <div>
                                            <p className="font-semibold">
                                                {fund.Papel}
                                            </p>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Rank #{fund.Rank}
                                            </p>
                                        </div>
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