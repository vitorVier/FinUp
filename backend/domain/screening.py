from __future__ import annotations

import pandas as pd

from .constants import (
    DY_MAXIMO,
    DY_MINIMO,
    LIQUIDEZ_MINIMA,
    PVP_MAXIMO,
    PVP_MINIMO,
    VACANCIA_MAXIMA,
)

COLUNAS_OBRIGATORIAS = [
    "Papel",
    "Segmento",
    "Cotação",
    "Dividend Yield",
    "P/VP",
    "Valor de Mercado",
    "Liquidez",
    "Vacância Média",
]


class ColunasFaltantesError(ValueError):
    def __init__(self, faltantes: list[str]):
        self.faltantes = faltantes
        super().__init__(f"Colunas obrigatórias ausentes: {', '.join(faltantes)}")


def validar_colunas(df: pd.DataFrame) -> None:
    faltantes = [c for c in COLUNAS_OBRIGATORIAS if c not in df.columns]
    if faltantes:
        raise ColunasFaltantesError(faltantes)


def screen_funds(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    validar_colunas(df)
    df = df.copy()
    
    if "FFO Yield" not in df.columns:
        df["FFO Yield"] = None

    if df["Vacância Média"].median() > 1:
        df["Vacância Média"] = df["Vacância Média"] / 100

    passa_liquidez = df["Liquidez"] >= LIQUIDEZ_MINIMA
    passa_dy = df["Dividend Yield"].between(DY_MINIMO, DY_MAXIMO)
    passa_pvp = df["P/VP"].between(PVP_MINIMO, PVP_MAXIMO)
    passa_vacancia = df["Vacância Média"] <= VACANCIA_MAXIMA

    df_triado = df[passa_liquidez & passa_dy & passa_pvp & passa_vacancia].copy()

    log = {
        "total_inicial": len(df),
        "passam_liquidez": int(passa_liquidez.sum()),
        "passam_dy": int(passa_dy.sum()),
        "passam_pvp": int(passa_pvp.sum()),
        "passam_vacancia": int(passa_vacancia.sum()),
        "passam_todos": len(df_triado),
    }
    return df_triado.reset_index(drop=True), log