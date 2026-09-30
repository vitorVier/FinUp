"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Goal, GoalFormData } from "@/src/app/(panel)/finance/types";

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function parseResponse(response: Response) {
        const contentType = response.headers.get("content-type") ?? "";

        if (!contentType.includes("application/json")) {
            const text = await response.text();

            console.error(
                "Resposta inesperada da API:",
                response.status,
                text.slice(0, 300)
            );

            throw new Error(
                `A API de metas não está disponível (${response.status}).`
            );
        }

        return response.json();
    }

    const loadGoals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/finance/goals", {
                cache: "no-store",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Não foi possível carregar as metas.");
            }

            setGoals(Array.isArray(data) ? data : []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar as metas.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const createGoal = useCallback(async (data: GoalFormData) => {
        const response = await fetch("/api/finance/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Não foi possível criar a meta.");

        setGoals((prev) => [result, ...prev]);
        toast.success("Meta criada com sucesso.");
    }, []);

    const updateGoal = useCallback(async (goal: Goal, data: GoalFormData) => {
        const response = await fetch(
            `/api/finance/goals/${goal.id}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }
        );

        const result = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                result.error || "Não foi possível atualizar a meta."
            );
        }

        setGoals((prev) =>
            prev.map((item) =>
                item.id === goal.id ? result : item
            )
        );

        toast.success("Meta atualizada.");
    }, []);

    const deleteGoal = useCallback(async (goal: Goal) => {
        const response = await fetch(
            `/api/finance/goals/${goal.id}`,
            {
                method: "DELETE",
            }
        );

        const result = await parseResponse(response);

        if (!response.ok) {
            throw new Error(
                result.error || "Não foi possível excluir a meta."
            );
        }

        setGoals((prev) =>
            prev.filter((item) => item.id !== goal.id)
        );

        toast.success("Meta excluída.");
    }, []);

    return {
        goals,
        loading,
        error,
        reload: loadGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        parseResponse
    };
}
