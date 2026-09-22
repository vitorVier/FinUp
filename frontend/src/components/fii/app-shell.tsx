"use client";

import { useMemo, useState } from "react";

import { SourceCard } from "@/src/components/fii/source-card";
import { Top10 } from "@/src/components/fii/top10";
import { RankingTable } from "@/src/components/fii/ranking-table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

import { FundDetail } from "@/src/components/fii/fund-detail";
import { Diagnostics } from "@/src/components/fii/diagnostics";

import type { Fund } from "@/src/types";
import { NavigationHeader } from "../header";
import { useAnalysis } from "@/src/hooks/useAnalysis";

export function AppShell() {
  const [page, setPage] = useState<"analise" | "diagnostico">("analise");
  const { data, updatedAt, loading, error, run, upload } = useAnalysis();
  const [selected, setSelected] = useState<Fund | null>(null);

  const [sortMode, setSortMode] = useState<"fuzzy" | "tradicional">("tradicional");

  const sortedTop10 = useMemo(() => {
    if (!data?.top10) return [];

    return [...data.top10].sort((a, b) => {
      if (sortMode === "fuzzy") return b.Nota_Final - a.Nota_Final;
      return a.Soma_Ranks_Simples - b.Soma_Ranks_Simples;
    });
  }, [data?.top10, sortMode]);

  return (
    <div className="min-h-screen">
      <NavigationHeader page={page} setPage={setPage} run={() => run("/analysis/run")} loading={loading} />

      <main className="mx-auto max-w-[1500px] px-6 py-10">
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
            <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Análise de FIIs
                </h1>
                <p className="mt-2 max-w-md text-sm text-slate-400">
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

            <section className="mt-12">
              <Top10
                funds={sortedTop10}
                onSelect={setSelected}
                data={data}
                sortMode={sortMode}
                onSortModeChange={setSortMode}
              />
            </section>

            <section className="mt-14 w-full overflow-clip">
              <SectionTitle
                title="Ranking completo"
                description="Clique em uma linha para abrir a análise detalhada."
              />

              <RankingTable funds={data.ranking_completo} onSelect={setSelected} />
            </section>
          </>
        ) : (
          <>
            <div className="mb-10 border-b border-border pb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                Diagnóstico do modelo
              </h1>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                Área de auditoria: triagem, consistência e comportamento do sistema fuzzy.
              </p>
            </div>

            <Diagnostics analysis={data} onSelect={setSelected} />
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
