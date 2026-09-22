"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecommendationBadge } from "@/components/fii/recommendation-badge";
import { formatPct } from "@/lib/utils";
import type { Fund } from "@/types";

const COLUMNS: [keyof Fund, string][] = [
  ["Rank", "Rank"],
  ["Papel", "Papel"],
  ["Segmento", "Segmento"],
  ["Dividend Yield", "DY"],
  ["P/VP", "P/VP"],
  ["Nota_Final", "Nota"],
  ["Recomendacao", "Recomendação"],
];

export function RankingTable({ funds, onSelect }: { funds: Fund[]; onSelect: (f: Fund) => void }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("all");
  const [rec, setRec] = useState("all");
  const [sort, setSort] = useState<keyof Fund>("Rank");
  const [desc, setDesc] = useState(false);

  const segments = [...new Set(funds.map((f) => f.Segmento).filter(Boolean))].sort();

  const filtered = useMemo(
    () =>
      funds
        .filter(
          (f) =>
            f.Papel.toLowerCase().includes(q.toLowerCase()) &&
            (seg === "all" || f.Segmento === seg) &&
            (rec === "all" || f.Recomendacao === rec)
        )
        .sort((a, b) => {
          const av = a[sort] as any;
          const bv = b[sort] as any;
          return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
        }),
    [funds, q, seg, rec, sort, desc]
  );

  const toggle = (k: keyof Fund) => {
    if (sort === k) setDesc(!desc);
    else {
      setSort(k);
      setDesc(false);
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
            <SelectTrigger className="min-w-0 flex-1 sm:w-[180px]">
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
        </div>
      </div>

      <div className="scrollbar w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs text-slate-400">
              {COLUMNS.map(([key, label]) => (
                <th key={key} className="whitespace-nowrap px-4 py-3">
                  <button className="inline-flex items-center gap-1 font-semibold" onClick={() => toggle(key)}>
                    {label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.Papel} onClick={() => onSelect(f)} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="number px-4 py-3 font-semibold">#{f.Rank}</td>
                <td className="px-4 py-3 font-bold">{f.Papel}</td>
                <td className="px-4 py-3 text-slate-400">{f.Segmento}</td>
                <td className="number px-4 py-3">{formatPct(f["Dividend Yield"])}</td>
                <td className="number px-4 py-3">{f["P/VP"].toFixed(2)}</td>
                <td className="number px-4 py-3 font-bold">{f.Nota_Final.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <RecommendationBadge value={f.Recomendacao} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3 text-xs text-slate-400">
        {filtered.length} de {funds.length} fundos exibidos
      </div>
    </div>
  );
}
