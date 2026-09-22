"use client";

import { Upload, RefreshCw, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SourceCard({
  loading,
  onRefresh,
  onUpload,
}: {
  loading: boolean;
  onRefresh: () => void;
  onUpload: (f: File) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Origem dos dados</CardTitle>
        <CardDescription>Atualize pelo Fundamentus ou use uma planilha compatível.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Button onClick={onRefresh} disabled={loading} className="justify-center">
            <RefreshCw className={loading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            {loading ? "Atualizando…" : "Atualizar via Fundamentus"}
          </Button>

          <label className="flex h-10 cursor-pointer items-center justify-center rounded border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
            <Upload className="mr-2 h-4 w-4" />
            Upload XLSX
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded border border-border bg-secondary/50 p-3 text-xs text-slate-400">
          <FileSpreadsheet className="h-4 w-4 shrink-0" />
          Colunas esperadas: Papel, Segmento, Cotação, Dividend Yield, P/VP, Valor de Mercado, Liquidez e Vacância Média.
        </div>
      </CardContent>
    </Card>
  );
}
