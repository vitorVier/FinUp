"""Monta os dados de gráfico como estruturas JSON simples.

Nada aqui desenha nada — é só amostragem das funções de pertinência e
organização dos pontos que o front (Recharts/Chart.js) vai plotar.
Substitui inteiramente o antigo graphs.py baseado em matplotlib.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from skfuzzy import control as ctrl

from domain.fuzzy_system import FuzzySystem

# Quantos pontos amostrar de cada curva de pertinência ao enviar para o front.
# O universo original pode ter milhares de pontos (passo 0.0001); isso seria
# payload desnecessário. 120 pontos já dá uma curva suave no gráfico.
RESOLUCAO_CURVA = 120


def _amostrar_curva(variavel: ctrl.Antecedent, termo: str) -> list[dict]:
    universo = variavel.universe
    if len(universo) > RESOLUCAO_CURVA:
        indices = np.linspace(0, len(universo) - 1, RESOLUCAO_CURVA).astype(int)
        xs = universo[indices]
        ys = variavel[termo].mf[indices]
    else:
        xs, ys = universo, variavel[termo].mf
    return [{"x": round(float(x), 6), "y": round(float(y), 4)} for x, y in zip(xs, ys)]


def _curvas_da_variavel(variavel: ctrl.Antecedent, termos: list[str]) -> list[dict]:
    return [{"termo": termo, "pontos": _amostrar_curva(variavel, termo)} for termo in termos]


def pertinencia_estagio1(fs: FuzzySystem) -> dict:
    """Curvas de DY, P/VP, Liquidez e Vacância (entradas do 1º estágio)."""
    return {
        "dy": _curvas_da_variavel(fs.dy, ["baixo", "moderado", "bom", "alto", "muito_alto_alerta"]),
        "pvp": _curvas_da_variavel(fs.pvp, ["otimo", "bom", "razoavel", "caro"]),
        "liquidez": _curvas_da_variavel(fs.liquidez, ["aceitavel", "boa", "excelente"]),
        "vacancia": _curvas_da_variavel(fs.vacancia, ["baixa", "moderada", "alta"]),
    }


def pertinencia_estagio2(fs: FuzzySystem) -> dict:
    """Curvas de nota e dos três alertas (entradas do 2º estágio)."""
    return {
        "nota": _curvas_da_variavel(fs.nota, ["baixa", "media", "alta"]),
        "alerta": _curvas_da_variavel(fs.alerta, ["baixo", "medio", "alto"]),
        "pvp_risco": _curvas_da_variavel(fs.pvp_risco, ["baixo", "medio", "alto"]),
        "vacancia_risco": _curvas_da_variavel(fs.vacancia_risco, ["baixo", "medio", "alto"]),
    }


def recomendacao_top10(df_ranked: pd.DataFrame, fs: FuzzySystem) -> dict:
    """Curvas risco/analisar/comprar + os fundos do TOP10 posicionados nelas."""
    top10 = df_ranked.head(10)
    fundos = []
    for _, row in top10.iterrows():
        graus = {
            "risco": float(row["Grau_Risco"]),
            "analisar": float(row["Grau_Analisar"]),
            "comprar": float(row["Grau_Comprar"]),
        }
        termo_dominante = max(graus, key=graus.get)
        fundos.append({
            "papel": row["Papel"],
            "rank": int(row["Rank"]),
            "x": float(row["Valor_Recomendacao"]),
            "y": graus[termo_dominante],
            "recomendacao": row["Recomendacao"],
            "nota_final": float(row["Nota_Final"]),
        })

    return {
        "curvas": _curvas_da_variavel(fs.recomendacao, ["risco", "analisar", "comprar"]),
        "fundos": fundos,
    }


def funil_triagem(log: dict) -> list[dict]:
    etapas = [
        ("Total inicial", "total_inicial"),
        ("Passam liquidez", "passam_liquidez"),
        ("Passam DY", "passam_dy"),
        ("Passam P/VP", "passam_pvp"),
        ("Passam vacância", "passam_vacancia"),
        ("Passam todos", "passam_todos"),
    ]
    return [{"etapa": nome, "valor": int(log[chave])} for nome, chave in etapas]


def fuzzy_vs_rank_sum(df_ranked: pd.DataFrame) -> list[dict]:
    """Pontos para o gráfico de dispersão nota fuzzy × soma de ranks tradicional."""
    return [
        {
            "papel": row["Papel"],
            "rank": int(row["Rank"]),
            "soma_ranks": int(row["Soma_Ranks_Simples"]),
            "nota_final": float(row["Nota_Final"]),
            "no_top10": bool(row["Rank"] <= 10),
        }
        for _, row in df_ranked.iterrows()
    ]


def build_all_chart_data(df_ranked: pd.DataFrame, log: dict, fs: FuzzySystem) -> dict:
    return {
        "pertinencia_estagio1": pertinencia_estagio1(fs),
        "pertinencia_estagio2": pertinencia_estagio2(fs),
        "recomendacao_top10": recomendacao_top10(df_ranked, fs),
        "funil_triagem": funil_triagem(log),
        "fuzzy_vs_rank_sum": fuzzy_vs_rank_sum(df_ranked),
    }