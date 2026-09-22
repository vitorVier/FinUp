"use client";

import { BarChart3, LineChartIcon, RefreshCw, WalletCards } from "lucide-react";
import { Button } from "./ui/button";

export function NavigationHeader({
  loading,
  run,
  page,
  setPage,
}: {
  loading: boolean;
  run: () => void;
  page: "analise" | "diagnostico";
  setPage: (page: "analise" | "diagnostico") => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
            <WalletCards className="h-4 w-4" />
          </div>

          <div className="min-w-0 leading-none">
            <span className="block truncate text-sm font-bold tracking-tight text-foreground">
              FII Fuzzy
            </span>
            <span className="hidden text-[10px] text-slate-400 sm:block">
              Análise quantitativa
            </span>
          </div>
        </div>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => setPage("analise")}
            className={`flex h-9 items-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors ${
              page === "analise"
                ? "border border-border text-foreground"
                : "border border-transparent text-slate-400 hover:text-foreground"
            }`}
          >
            <LineChartIcon className="h-3.5 w-3.5" />
            Análise
          </button>

          <button
            type="button"
            onClick={() => setPage("diagnostico")}
            className={`flex h-9 items-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors ${
              page === "diagnostico"
                ? "border border-border text-foreground"
                : "border border-transparent text-slate-400 hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Diagnóstico
          </button>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={run}
          disabled={loading}
          className="h-9 gap-2 px-2.5 text-xs text-slate-400 hover:text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {loading ? "Atualizando…" : "Atualizar dados"}
          </span>
        </Button>
      </div>
    </header>
  );
}
