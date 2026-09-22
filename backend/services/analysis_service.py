from __future__ import annotations

import pandas as pd

from domain.fuzzy_system import FuzzySystem, build_fuzzy_system
from domain.ranking import gerar_resumo_comparativo, rank_funds
from domain.scoring import score_all_funds
from domain.screening import ColunasFaltantesError, screen_funds

from . import chart_data_service

COLUNAS_TOP10 = [
    "Rank", "Papel", "Segmento", "Cotação", "Dividend Yield", "FFO Yield", "P/VP", "Vacância Média",
    "Rank_DY", "Rank_PVP", "Soma_Ranks_Simples",
    "Nota_Final", "Recomendacao", "Preco_Alvo_Min", "Preco_Alvo_Max", "Liquidez",
    "Regra_Dominante_Oportunidade", "Forca_Regra_Oportunidade",
    "Regra_Dominante_Recomendacao", "Forca_Regra_Recomendacao",

    "Valor_Recomendacao", "Grau_Risco", "Grau_Analisar", "Grau_Comprar",
    "Grau_Alerta_DY", "Grau_Caro_PVP", "Grau_Vacancia_Alta", "Qualidade_Liquidez",
]

COLUNAS_RANKING_COMPLETO = COLUNAS_TOP10  # mesma projeção, só que sem o .head(10)


class SemFundosAposTriagemError(Exception):
    """Nenhum fundo passou pelos filtros mínimos."""


def _to_records(df: pd.DataFrame, colunas: list[str]) -> list[dict]:
    projetado = df[colunas]
    return projetado.where(pd.notnull(projetado), None).to_dict(orient="records")


def build_rule_table(fs: FuzzySystem) -> list[dict]:
    linhas = [
        {"estagio": "1 - Oportunidade", "numero": i + 1, "regra": desc}
        for i, desc in enumerate(fs.regras_oportunidade_desc)
    ] + [
        {"estagio": "2 - Recomendação", "numero": i + 1, "regra": desc}
        for i, desc in enumerate(fs.regras_recomendacao_desc)
    ]
    return linhas


def run_analysis(df_raw: pd.DataFrame, fonte: str) -> dict:
    df_triado, log = screen_funds(df_raw)  # pode levantar ColunasFaltantesError

    if df_triado.empty:
        raise SemFundosAposTriagemError(
            f"Nenhum fundo passou pela triagem (de {log['total_inicial']} analisados)."
        )

    fs = build_fuzzy_system()
    df_scored = score_all_funds(df_triado, fs)
    df_ranked = rank_funds(df_scored)
    df_comparativo = gerar_resumo_comparativo(df_ranked)

    charts = chart_data_service.build_all_chart_data(df_ranked, log, fs)

    return {
        "fonte": fonte,
        "log_triagem": log,
        "top10": _to_records(df_ranked.head(10), COLUNAS_TOP10),
        "ranking_completo": _to_records(df_ranked, COLUNAS_RANKING_COMPLETO),
        "comparacao_fuzzy_tradicional": df_comparativo.to_dict(orient="records"),
        "regras_fuzzy": build_rule_table(fs),
        "charts": charts,
    }