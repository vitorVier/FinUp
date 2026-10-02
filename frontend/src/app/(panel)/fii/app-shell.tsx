"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { SourceCard } from "./components/source-card";
import { Top10 } from "./components/top10";
import { RankingTable } from "./components/ranking-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

import { FundDetail } from "./components/fund-detail";
import { Diagnostics } from "./components/diagnostics";

import type { Fund } from "@/src/types";
import { useAnalysis } from "@/src/hooks/useAnalysis";
import { useOportunities } from "@/src/hooks/useOportunities";

export function AppShell() {
  const pathname = usePathname();
  const page: "analise" | "diagnostico" =
    pathname === "/fii/diagnostico" ? "diagnostico" : "analise";

  const { data, updatedAt, loading, error, run, upload } = useAnalysis();
  const { sync, ack } = useOportunities();
  const [savedFunds, setSavedFunds] = useState<
    { papel: string; list: "WALLET" | "WATCHLIST" }[]
  >([]);
  const [selected, setSelected] = useState<Fund | null>(null);
  const [sortMode, setSortMode] = useState<"fuzzy" | "tradicional">("tradicional");

  useEffect(() => {
    async function loadSavedFunds() {
      try {
        const response = await fetch("/api/user-fund");

        if (!response.ok) return;

        const funds = await response.json();

        setSavedFunds(funds);
      } catch {
        // silencioso
      }
    }

    loadSavedFunds();
  }, []);

  useEffect(() => {
    if (!data?.ranking_completo || savedFunds.length === 0) return;

    const savedTickers = new Set(
      savedFunds.map((fund) => fund.papel)
    );

    const fundsToSync = data.ranking_completo
      .filter((fund) => savedTickers.has(fund.Papel))
      .map((fund) => ({
        papel: fund.Papel,
        recomendacao: fund.Recomendacao,
        notaFinal: Number(fund.Nota_Final ?? 0),
      }));

    if (fundsToSync.length > 0) {
      sync(fundsToSync);
    }
  }, [data, savedFunds, sync]);

  const sortedTop10 = useMemo(() => {
    if (!data?.top10) return [];

    return [...data.top10].sort((a, b) => {
      if (sortMode === "fuzzy") return b.Nota_Final - a.Nota_Final;
      return a.Soma_Ranks_Simples - b.Soma_Ranks_Simples;
    });
  }, [data?.top10, sortMode]);

  const handleSelect = (fund: Fund) => {
    setSelected(fund);

    const isSaved = savedFunds.some(
      (saved) => saved.papel === fund.Papel
    );

    if (isSaved) {
      ack(
        fund.Papel,
        fund.Recomendacao,
        Number(fund.Nota_Final ?? 0)
      );
    }
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {error && (
          <div className="mb-6 rounded border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!data && loading ? (
          <Loading />
        ) : !data ? (
          <EmptyState loading={loading} onRefresh={() => run("/analysis/run")} onUpload={upload} />
        ) : page === "analise" ? (
          <>
            <div className="mb-10 flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Análise de FIIs
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modelo fuzzy Mamdani aplicado aos fundos aprovados na triagem.
                </p>
              </div>

              {updatedAt && (
                <p className="whitespace-nowrap text-xs text-slate-400">
                  Atualizado às{" "}
                  {new Date(updatedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <SourceCard loading={loading} onRefresh={() => run("/analysis/run")} onUpload={upload} />

            <section className="mt-12 lg:mt-16">
              <Top10
                funds={sortedTop10}
                onSelect={handleSelect}
                data={data}
                sortMode={sortMode}
                onSortModeChange={setSortMode}
              />
            </section>

            <section className="mt-14 w-full overflow-clip lg:mt-20">
              <SectionTitle
                title="Ranking completo"
                description="Clique em uma linha para abrir a análise detalhada."
              />

              <RankingTable funds={data.ranking_completo} onSelect={handleSelect} />
            </section>
          </>
        ) : (
          <>
            <div className="mb-10 border-b border-border pb-5">
              <h1 className="text-2xl font-bold tracking-tight">
                Diagnóstico do modelo
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Área de auditoria: triagem, consistência e comportamento do sistema fuzzy.
              </p>
            </div>

            <Diagnostics analysis={data} onSelect={handleSelect} />
          </>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Detalhes do fundo</DialogTitle>
            <DialogDescription>Análise fuzzy detalhada do fundo selecionado.</DialogDescription>
          </DialogHeader>

          {selected && (
            <FundDetail fund={selected} analysis={data!} onClose={() => setSelected(null)} onSelect={setSelected} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({
  loading,
  onRefresh,
  onUpload,
}: {
  loading: boolean;
  onRefresh: () => void;
  onUpload: (f: File) => void;
}) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
        Nenhuma análise carregada ainda
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        Busque os dados mais recentes no Fundamentus ou envie uma planilha compatível pra começar.
      </p>
      <div className="mt-8 text-left">
        <SourceCard loading={loading} onRefresh={onRefresh} onUpload={onUpload} />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid gap-4">
      <div className="h-28 animate-pulse rounded border border-border bg-secondary" />
      <div className="h-52 animate-pulse rounded border border-border bg-secondary" />
      <div className="h-96 animate-pulse rounded border border-border bg-secondary" />
    </div>
  );
}
