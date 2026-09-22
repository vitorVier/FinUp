import { ArrowUpRight, BarChart3, Percent, Target } from "lucide-react";

import { Card, CardContent } from "@/src/components/ui/card";
import { RecommendationBadge } from "@/src/components/fii/recommendation-badge";
import { formatBRL, formatPct } from "@/src/lib/utils";
import type { Analysis, Fund } from "@/src/types";
import { SectionTitle } from "./app-shell";

type SortMode = "fuzzy" | "tradicional";

interface Top10Props {
  funds: Fund[];
  data: Analysis;
  onSelect: (fund: Fund) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}

function getRankStyle(rank: number) {
  if (rank === 1) return { badge: "bg-primary text-primary-foreground", label: "TOP 1", score: "text-primary" };
  if (rank === 2) return { badge: "bg-foreground text-background", label: "TOP 2", score: "text-foreground" };
  if (rank === 3) return { badge: "bg-warning text-warning-foreground", label: "TOP 3", score: "text-foreground" };
  return { badge: "bg-secondary text-slate-400", label: `#${rank}`, score: "text-foreground" };
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="min-w-0 rounded border border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-[13px] font-bold leading-tight tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function Top10({ funds, data, onSelect, sortMode, onSortModeChange }: Top10Props) {
  return (
    <>
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionTitle
          title="TOP 10"
          description={`Melhores fundos pela nota fuzzy + ranking de apoio · fonte: ${data.fonte}`}
        />

        <div className="mb-5 flex w-fit gap-1 rounded border border-border p-1">
          <button
            type="button"
            onClick={() => onSortModeChange("tradicional")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${sortMode === "tradicional" ? "bg-secondary text-foreground" : "text-slate-400 hover:text-foreground"
              }`}
          >
            Nota 2 em 1
          </button>
          <button
            type="button"
            onClick={() => onSortModeChange("fuzzy")}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${sortMode === "fuzzy" ? "bg-secondary text-foreground" : "text-slate-400 hover:text-foreground"
              }`}
          >
            Nota fuzzy
          </button>
        </div>
      </section>

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {funds.map((fund) => (
          <FundCard key={fund.Papel} fund={fund} onSelect={onSelect} />
        ))}
      </div>
    </>
  );
}

function FundCard({
  fund,
  onSelect,
}: {
  fund: Fund;
  onSelect: (fund: Fund) => void;
}) {
  const rankStyle = getRankStyle(fund.Rank);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(fund)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(fund);
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col transition-colors hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
    >
      <CardContent className="flex flex-1 flex-col p-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className={`inline-flex h-4 items-center justify-center rounded px-1.5 text-[8px] font-bold ${rankStyle.badge}`}>
              {rankStyle.label}
            </span>

            <div className="mt-2 flex min-w-0 items-center gap-1">
              <h3 className="truncate text-[13px] font-extrabold tracking-tight text-foreground">
                {fund.Papel}
              </h3>
              <ArrowUpRight
                className="h-3 w-3 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>

            <p className="mt-0.5 truncate text-[10px] text-slate-400">{fund.Segmento}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-400">Nota</p>
            <p className={`mt-0.5 text-lg font-extrabold leading-none tabular-nums ${rankStyle.score}`}>
              {fund.Nota_Final.toFixed(1)}
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">fuzzy</p>
          </div>
        </div>

        <div className="mt-3 flex min-h-5 items-center justify-between gap-1">
          <RecommendationBadge value={fund.Recomendacao} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Metric label="DY" value={formatPct(fund["Dividend Yield"])} icon={Percent} />
          <Metric label="P/VP" value={fund["P/VP"].toFixed(2)} icon={BarChart3} />
          <Metric label="Cotação" value={formatBRL(fund.Cotação)} icon={Target} />
          <Metric label="Alvo mín." value={formatBRL(fund.Preco_Alvo_Min)} icon={Target} />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5 mt-3">
          <span className="truncate text-[8px] text-slate-400">Clique para analisar</span>
          <ArrowUpRight
            className="h-3 w-3 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}
