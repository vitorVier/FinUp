"use client";

import { useEffect, useState } from "react";
import type { CashFlowAnalytics } from "../types/analytics";

interface UseCashFlowAnalyticsProps {
    months?: number;
}

export function useCashFlowAnalytics({
    months = 6,
}: UseCashFlowAnalyticsProps = {}) {
    const [data, setData] =
        useState<CashFlowAnalytics | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/finance/analytics/cash-flow?months=${months}`
                );

                const json = await response.json();

                if (!response.ok) {
                    throw new Error(
                        json.error ||
                        "Erro ao carregar análise de fluxo."
                    );
                }

                if (!cancelled) {
                    setData(json);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Erro ao carregar análise."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [months]);

    return {
        data,
        loading,
        error,
    };
}