"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Eye, EyeIcon, EyeOff, Search, SlidersHorizontal, Star, StarIcon } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { RecommendationBadge } from "@/src/components/fii/recommendation-badge";
import { formatPct } from "@/src/lib/utils";
import type { Fund } from "@/src/types";

const COLUMNS: { key: keyof Fund | "actions"; label: string; className: string }[] = [
  { key: "Rank", label: "Rank", className: "px-6" },
  { key: "Papel", label: "Papel", className: "px-6" },
  { key: "Segmento", label: "Segmento", className: "px-6" },
  { key: "Dividend Yield", label: "DY", className: "px-6" },
  { key: "P/VP", label: "P/VP", className: "px-5" },
  { key: "Nota_Final", label: "Nota", className: "px-4" },
  { key: "Recomendacao", label: "Recomendação", className: "px-4" },
  { key: "actions", label: "", className: "px-6" },
];

export function RankingTable({ funds, onSelect }: { funds: Fund[]; onSelect: (f: Fund) => void }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("all");
  const [rec, setRec] = useState("all");
  const [sort, setSort] = useState<keyof Fund>("Rank");
  const [desc, setDesc] = useState(false);
  const [listFilter, setListFilter] = useState<"all" | "WALLET" | "WATCHLIST">("all");
  const [myFunds, setMyFunds] = useState<Map<string, "WALLET" | "WATCHLIST">>(new Map());
  const pending = useRef<Set<string>>(new Set());

  // Carrega estado real do servidor ao montar
  useEffect(() => {
    fetch("/api/user-fund")
      .then((res) => res.json())
      .then((data: { papel: string; list: "WALLET" | "WATCHLIST" }[]) => {
        if (!Array.isArray(data)) return;
        setMyFunds(new Map(data.map((f) => [f.papel, f.list])));
      })
      .catch(() => { });
  }, []);


  const segments = [...new Set(funds.map((f) => f.Segmento).filter(Boolean))].sort();

  const filtered = useMemo(
    () =>
      funds
        .filter(
          (f) =>
            f.Papel.toLowerCase().includes(q.toLowerCase()) &&
            (seg === "all" || f.Segmento === seg) &&
            (rec === "all" || f.Recomendacao === rec) &&
            (listFilter === "all" || myFunds.get(f.Papel) === listFilter)
        )
        .sort((a, b) => {
          const av = a[sort] as any;
          const bv = b[sort] as any;
          return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
        }),
    [funds, q, seg, rec, listFilter, myFunds, sort, desc]
  );

  const toggle = (k: keyof Fund) => {
    if (sort === k) setDesc(!desc);
    else {
      setSort(k);
      setDesc(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, papel: string) => {
    e.stopPropagation();
    if (pending.current.has(papel)) return;
    pending.current.add(papel);

    try {
      const response = await fetch(`/api/user-fund/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papel }),
      });

      if (!response.ok) return;

      const { favorite } = await response.json();

      setMyFunds((prev) => {
        const next = new Map(prev);
        if (favorite) {
          next.set(papel, "WALLET");
        } else {
          next.delete(papel);
        }
        return next;
      });
    } finally {
      pending.current.delete(papel);
    }
  };

  const toggleWatchList = async (e: React.MouseEvent, papel: string) => {
    e.stopPropagation();
    if (pending.current.has(papel)) return;
    pending.current.add(papel);

    try {
      const response = await fetch(`/api/user-fund/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ papel }),
      });

      if (!response.ok) return;

      const { favorite } = await response.json();

      setMyFunds((prev) => {
        const next = new Map(prev);
        if (favorite) {
          next.set(papel, "WATCHLIST");
        } else {
          next.delete(papel);
        }
        return next;
      });
    } finally {
      pending.current.delete(papel);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="w-full pl-9" placeholder="Buscar papel…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
          <Select value={seg} onValueChange={setSeg}>
            <SelectTrigger className="min-w-0 flex-1 sm:w-[180px] pr-8">
              <div className="flex min-w-0 items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{seg === "all" ? "Todos segmentos" : seg}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos segmentos</SelectItem>
              {segments.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rec} onValueChange={setRec}>
            <SelectTrigger className="min-w-0 flex-1 whitespace-nowrap sm:w-[130px]">
              <SelectValue placeholder="Recomendação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Comprar">Comprar</SelectItem>
              <SelectItem value="Analisar">Analisar</SelectItem>
              <SelectItem value="Risco Alto">Risco Alto</SelectItem>
            </SelectContent>
          </Select>

          <Select value={listFilter} onValueChange={(val: any) => setListFilter(val)}>
            <SelectTrigger className="min-w-0 flex-1 whitespace-nowrap sm:w-[130px]">
              <SelectValue placeholder="Lista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Minhas listas</SelectItem>
              <SelectItem value="WALLET">Carteira</SelectItem>
              <SelectItem value="WATCHLIST">Watchlist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="scrollbar w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs text-slate-400">
              {COLUMNS.map(({ key, label, className }) => (
                <th key={key} className={`whitespace-nowrap py-3 ${className}`}>
                  {key !== "actions" ? (
                    <button className="inline-flex items-center gap-1 font-semibold" onClick={() => toggle(key as keyof Fund)}>
                      {label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const isWallet = myFunds.has(f.Papel) && myFunds.get(f.Papel) === "WALLET";
              const isWatchlist = myFunds.has(f.Papel) && myFunds.get(f.Papel) === "WATCHLIST";

              return (
                <tr
                  key={f.Papel}
                  onClick={() => onSelect(f)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"
                >
                  <td className="number px-6 py-3 font-semibold">
                    #{f.Rank}
                  </td>

                  <td className="px-6 py-3 font-bold">
                    {f.Papel}
                  </td>

                  <td className="px-6 py-3 text-slate-400">
                    {f.Segmento}
                  </td>

                  <td className="number px-6 py-3">
                    {formatPct(f["Dividend Yield"])}
                  </td>

                  <td className="number px-5 py-3">
                    {f["P/VP"].toFixed(2)}
                  </td>

                  <td className="number px-4 py-3 font-bold">
                    {f.Nota_Final.toFixed(1)}
                  </td>

                  <td className="px-4 py-3">
                    <RecommendationBadge value={f.Recomendacao} />
                  </td>

                  <td className="flex items-center justify-end gap-3 px-6 py-3">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, f.Papel)}
                      className="flex items-center justify-center"
                      aria-label={
                        isWallet
                          ? "Remover da carteira"
                          : "Adicionar à carteira"
                      }
                    >
                      <StarIcon
                        size={20}
                        strokeWidth={1.5}
                        className={
                          isWallet
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleWatchList(e, f.Papel)}
                      className="group flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-blue-500/10"
                      aria-label={
                        isWatchlist
                          ? "Remover da Watchlist"
                          : "Adicionar à Watchlist"
                      }
                    >
                      {isWatchlist ? (
                        <Eye
                          size={19}
                          strokeWidth={2}
                          className="text-blue-500 transition-colors"
                        />
                      ) : (
                        <EyeOff
                          size={19}
                          strokeWidth={2}
                          className="text-muted-foreground/60 transition-colors group-hover:text-blue-500"
                        />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3 text-xs text-slate-400">
        {filtered.length} de {funds.length} fundos exibidos
      </div>
    </div>
  );
}
