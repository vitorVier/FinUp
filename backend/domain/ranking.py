"""Ranking final (2-em-1: Rank DY + Rank P/VP) e análises comparativas."""

from __future__ import annotations

import pandas as pd


def target_price_range(
    row: pd.Series, dy_alvo_baixo: float = 0.095, dy_alvo_alto: float = 0.115
) -> tuple[float, float]:
    cotacao = row["Cotação"]
    dy_atual = row["Dividend Yield"]
    preco_dy_alvo_alto = (cotacao * dy_atual) / dy_alvo_alto
    preco_dy_alvo_baixo = (cotacao * dy_atual) / dy_alvo_baixo
    baixo = round(min(preco_dy_alvo_alto, preco_dy_alvo_baixo), 2)
    alto = round(max(preco_dy_alvo_alto, preco_dy_alvo_baixo), 2)
    return baixo, alto


def rank_funds(df_scored: pd.DataFrame) -> pd.DataFrame:
    df = df_scored.copy()

    faixas = df.apply(target_price_range, axis=1)
    df["Preco_Alvo_Min"] = [f[0] for f in faixas]
    df["Preco_Alvo_Max"] = [f[1] for f in faixas]

    df["Rank_DY"] = df["Dividend Yield"].rank(ascending=False, method="min").astype(int)
    df["Rank_PVP"] = df["P/VP"].rank(ascending=True, method="min").astype(int)
    df["Soma_Ranks_Simples"] = df["Rank_DY"] + df["Rank_PVP"]

    df_ranked = df.sort_values(
        ["Soma_Ranks_Simples", "Nota_Final"], ascending=[True, False]
    ).reset_index(drop=True)
    df_ranked.insert(0, "Rank", range(1, len(df_ranked) + 1))
    return df_ranked


def gerar_resumo_comparativo(df_ranked: pd.DataFrame) -> pd.DataFrame:
    df = df_ranked.copy()
    df["Rank_Fuzzy"] = df["Nota_Final"].rank(ascending=False, method="min").astype(int)
    df["Rank_Tradicional"] = df["Soma_Ranks_Simples"].rank(ascending=True, method="min").astype(int)
    df["Diferenca_Tradicional_vs_Fuzzy"] = df["Rank_Tradicional"] - df["Rank_Fuzzy"]

    return df[[
        "Papel", "Rank", "Rank_Tradicional", "Rank_Fuzzy",
        "Diferenca_Tradicional_vs_Fuzzy", "Nota_Final", "Soma_Ranks_Simples",
        "Recomendacao",
    ]].sort_values("Rank").reset_index(drop=True)