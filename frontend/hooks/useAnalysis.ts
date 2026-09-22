"use client";

import { useCallback, useEffect, useState } from "react";
import type { Analysis } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "";
const CACHE_KEY = "fii-fuzzy:last-analysis";

interface Cache {
    data: Analysis;
    updatedAt: string; // ISO
}

function readCache(): Cache | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        return raw ? (JSON.parse(raw) as Cache) : null;
    } catch {
        // localStorage indisponível (modo privado, quota etc.) — segue sem cache
        return null;
    }
}

function writeCache(data: Analysis, updatedAt: string) {
    try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, updatedAt }));
    } catch {
        // se não conseguir salvar, não é crítico — só perde o cache entre sessões
    }
}

export function useAnalysis() {
    const [data, setData] = useState<Analysis | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const cached = readCache();
        if (cached) {
            setData(cached.data);
            setUpdatedAt(cached.updatedAt);
        }
    }, []);

    const run = useCallback(async (url: string, opts: RequestInit = {}) => {
        setLoading(true);
        setError("");

        try {
            const r = await fetch(`${API}${url}`, {
                method: "POST",
                ...opts,
            });

            const body = await r.json();

            if (!r.ok) {
                throw new Error(body?.detail || "Não foi possível executar a análise.");
            }

            const analise = body as Analysis;
            const agora = new Date().toISOString();

            setData(analise);
            setUpdatedAt(agora);
            writeCache(analise, agora);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro inesperado");
        } finally {
            setLoading(false);
        }
    }, []);

    const upload = useCallback(
        (file: File) => {
            const fd = new FormData();
            fd.append("arquivo", file);
            run("/analysis/run-upload", { body: fd });
        },
        [run]
    );

    return { data, updatedAt, loading, error, run, upload };
}