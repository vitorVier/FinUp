"use client";

import { useCallback, useState } from "react";

type StatusMudanca = "oportunidade" | "mudou";

interface FundoParaSync {
    papel: string;
    recomendacao: string;
    notaFinal: number;
}

export function useOportunities() {
    const [mudancas, setMudancas] = useState<Record<string, StatusMudanca>>({});

    // Chame isso sempre que uma análise nova carregar, passando só os
    // fundos salvos do usuário que aparecem no ranking atual.
    const sync = useCallback(async (funds: FundoParaSync[]) => {
        if (funds.length === 0) {
            setMudancas({});
            return;
        }
        try {
            const r = await fetch("/api/user-fund/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ funds }),
            });
            if (!r.ok) return;
            const { mudancas: novasMudancas } = await r.json();
            setMudancas(novasMudancas);
        } catch {

        }
    }, []);

    // Chame isso quando o usuário abrir o detalhe de um fundo salvo — isso
    // é o que efetivamente apaga o badge desse fundo especificamente.
    const ack = useCallback(async (papel: string, recomendacao: string, notaFinal: number) => {
        // Otimista: já limpa o badge na tela antes da resposta do servidor.
        setMudancas((prev) => {
            if (!(papel in prev)) return prev;
            const next = { ...prev };
            delete next[papel];
            return next;
        });

        try {
            await fetch(`/api/user-fund/${encodeURIComponent(papel)}/ack`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recomendacao, notaFinal }),
            });
        } catch {
            // se falhar, o pior caso é o badge voltar a aparecer na próxima
            // sync (porque o servidor não gravou) — não é destrutivo
        }
    }, []);

    return { mudancas, sync, ack };
}