"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import { FundDetail } from "@/src/components/fii/fund-detail";

import { MyFundsHeader } from "./components/my-funds-header";
import { MyFundsStats } from "./components/my-funds-stats";
import {
    MyFundsTabs,
    type FundListTab,
} from "./components/my-funds-tabs";
import { MyFundsTable } from "./components/my-funds-table";
import { MyFundsEmpty } from "./components/my-funds-empty";

import { useAnalysis } from "@/src/hooks/useAnalysis";

import type { Fund } from "@/src/types";

type UserFund = {
    id: string;
    userId: string;
    papel: string;
    list: "WALLET" | "WATCHLIST";
    createdAt: string;
    updatedAt: string;
};

export default function MeusFundosPage() {
    const { data: analysis, loading: analysisLoading } = useAnalysis();

    const [wallet, setWallet] = useState<UserFund[]>([]);
    const [watchlist, setWatchlist] = useState<UserFund[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] =
        useState<FundListTab>("wallet");

    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Fund | null>(null);

    const loadFunds = async () => {
        try {
            setLoading(true);
            setError(null);

            const [walletResponse, watchlistResponse] =
                await Promise.all([
                    fetch("/api/user-fund/wallet"),
                    fetch("/api/user-fund/watchlist"),
                ]);

            if (!walletResponse.ok || !watchlistResponse.ok) {
                throw new Error(
                    "Não foi possível carregar seus fundos."
                );
            }

            const [walletData, watchlistData] =
                await Promise.all([
                    walletResponse.json(),
                    watchlistResponse.json(),
                ]);

            setWallet(walletData);
            setWatchlist(watchlistData);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar seus fundos."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFunds();
    }, []);

    const currentList =
        activeTab === "wallet" ? wallet : watchlist;

    const walletTickers = useMemo(
        () => new Set(wallet.map((fund) => fund.papel)),
        [wallet]
    );

    const watchlistTickers = useMemo(
        () => new Set(watchlist.map((fund) => fund.papel)),
        [watchlist]
    );

    const funds = useMemo(() => {
        if (!analysis?.ranking_completo) return [];

        const query = search.trim().toLowerCase();

        return currentList
            .map((item) =>
                analysis.ranking_completo.find(
                    (fund) => fund.Papel === item.papel
                )
            )
            .filter((fund): fund is Fund => Boolean(fund))
            .filter((fund) =>
                query
                    ? fund.Papel.toLowerCase().includes(query) ||
                    fund.Segmento?.toLowerCase().includes(query)
                    : true
            );
    }, [analysis, currentList, search]);

    const toggleList = async (
        e: React.MouseEvent,
        papel: string,
        list: "WALLET" | "WATCHLIST"
    ) => {
        e.stopPropagation();

        const endpoint =
            list === "WALLET"
                ? "/api/user-fund/wallet"
                : "/api/user-fund/watchlist";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ papel, list }),
        });

        if (response.ok) {
            await loadFunds();
        }
    };

    return (
        <>
            <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <MyFundsHeader
                    search={search}
                    onSearchChange={setSearch}
                />

                <MyFundsStats
                    total={
                        new Set([
                            ...wallet.map((f) => f.papel),
                            ...watchlist.map((f) => f.papel),
                        ]).size
                    }
                    wallet={wallet.length}
                    watchlist={watchlist.length}
                />

                <Card className="mt-6 overflow-hidden">
                    <CardHeader className="border-b pb-4">
                        <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    Seus fundos
                                </CardTitle>

                                <p className="text-xs text-muted-foreground">
                                    Fundos salvos para acompanhamento.
                                </p>
                            </div>

                            <MyFundsTabs
                                activeTab={activeTab}
                                walletCount={wallet.length}
                                watchlistCount={watchlist.length}
                                onChange={setActiveTab}
                            />
                        </div>
                    </CardHeader>

                    <div className="w-full">
                        {loading || analysisLoading ? (
                            <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
                                Carregando seus fundos...
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-sm text-red-600">
                                {error}
                            </div>
                        ) : currentList.length === 0 ? (
                            <MyFundsEmpty
                                type="empty"
                                wallet={activeTab === "wallet"}
                            />
                        ) : funds.length === 0 ? (
                            <MyFundsEmpty type="search" />
                        ) : (
                            <MyFundsTable
                                funds={funds}
                                walletTickers={walletTickers}
                                watchlistTickers={watchlistTickers}
                                activeList={
                                    activeTab === "wallet"
                                        ? "WALLET"
                                        : "WATCHLIST"
                                }
                                onSelect={setSelected}
                                onToggle={toggleList}
                            />
                        )}

                        {currentList.length > 0 && (
                            <div className="border-t px-5 py-4 text-xs text-muted-foreground sm:px-6">
                                {funds.length} de{" "}
                                {currentList.length} fundos exibidos
                            </div>
                        )}
                    </div>
                </Card>

                {selected && analysis && (
                    <FundDetail
                        fund={selected}
                        analysis={analysis}
                        onClose={() => setSelected(null)}
                        onSelect={setSelected}
                    />
                )}
            </main>
        </>
    );
}