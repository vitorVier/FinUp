"""Avaliação fuzzy de cada fundo: nota de oportunidade, alertas e recomendação."""

from __future__ import annotations

import numpy as np
import pandas as pd
import skfuzzy as fuzz
from skfuzzy import control as ctrl

from .constants import VACANCIA_MAXIMA
from .fuzzy_system import FuzzySystem


def classify_liquity(valor: float, liquidez: ctrl.Antecedent) -> str:
    graus = {
        termo: fuzz.interp_membership(liquidez.universe, liquidez[termo].mf, valor)
        for termo in ("aceitavel", "boa", "excelente")
    }
    return max(graus, key=graus.get)


def grau_dy_muito_alto(valor: float, dy: ctrl.Antecedent) -> float:
    return float(fuzz.interp_membership(dy.universe, dy["muito_alto_alerta"].mf, valor))


def grau_pvp_caro(valor: float, pvp: ctrl.Antecedent) -> float:
    return float(fuzz.interp_membership(pvp.universe, pvp["caro"].mf, valor))


def grau_vacancia_alta(valor: float, vacancia: ctrl.Antecedent) -> float:
    valor_clip = min(valor, vacancia.universe[-1])
    return float(fuzz.interp_membership(vacancia.universe, vacancia["alta"].mf, valor_clip))


def grau_disparo_regra(termos: list[tuple[str, str]], valores: dict[str, float], variaveis: dict[str, ctrl.Antecedent]) -> float:
    graus = [
        fuzz.interp_membership(variaveis[var].universe, variaveis[var][termo].mf, valores[var])
        for var, termo in termos
    ]
    return float(min(graus)) if graus else 0.0


def regra_dominante(
    todos_termos: list[list[tuple[str, str]]],
    descricoes: list[str],
    valores: dict[str, float],
    variaveis: dict[str, ctrl.Antecedent],
):
    forcas = [grau_disparo_regra(termos, valores, variaveis) for termos in todos_termos]
    maior_forca = max(forcas, default=0.0)
    if maior_forca <= 0:
        return "Nenhuma regra ativada", 0.0
    index = int(np.argmax(forcas))
    return descricoes[index], round(forcas[index], 3)


def score_estate(row: pd.Series, fs: FuzzySystem) -> dict:
    sim_oportunidade = ctrl.ControlSystemSimulation(fs.sistema_oportunidade)
    sim_oportunidade.input["dy"] = float(row["Dividend Yield"])
    sim_oportunidade.input["pvp"] = float(row["P/VP"])
    sim_oportunidade.input["liquidez"] = float(row["Liquidez"])
    sim_oportunidade.input["vacancia"] = min(float(row["Vacância Média"]), VACANCIA_MAXIMA)
    sim_oportunidade.compute()
    nota_final = round(sim_oportunidade.output["oportunidade"], 2)

    grau_alerta = round(grau_dy_muito_alto(row["Dividend Yield"], fs.dy), 3)
    grau_caro = round(grau_pvp_caro(row["P/VP"], fs.pvp), 3)
    grau_vacancia = round(grau_vacancia_alta(row["Vacância Média"], fs.vacancia), 3)

    sim_recomendacao = ctrl.ControlSystemSimulation(fs.sistema_recomendacao)
    sim_recomendacao.input["nota"] = nota_final
    sim_recomendacao.input["alerta"] = grau_alerta
    sim_recomendacao.input["pvp_risco"] = grau_caro
    sim_recomendacao.input["vacancia_risco"] = grau_vacancia
    sim_recomendacao.compute()
    valor_recomendacao = sim_recomendacao.output["recomendacao"]

    graus_recomendacao = {
        termo: fuzz.interp_membership(fs.recomendacao.universe, fs.recomendacao[termo].mf, valor_recomendacao)
        for termo in ("risco", "analisar", "comprar")
    }
    rotulo_recomendacao = max(graus_recomendacao, key=graus_recomendacao.get)
    rotulos = {"risco": "Risco Alto", "analisar": "Analisar", "comprar": "Comprar"}

    valores_oportunidade = {
        "dy": float(row["Dividend Yield"]),
        "pvp": float(row["P/VP"]),
        "liquidez": float(row["Liquidez"]),
        "vacancia": min(float(row["Vacância Média"]), VACANCIA_MAXIMA),
    }
    variaveis_oportunidade = {"dy": fs.dy, "pvp": fs.pvp, "liquidez": fs.liquidez, "vacancia": fs.vacancia}
    desc_regra_oport, forca_regra_oport = regra_dominante(
        fs.regras_oportunidade_termos, fs.regras_oportunidade_desc, valores_oportunidade, variaveis_oportunidade
    )

    valores_recomendacao = {
        "nota": nota_final, "alerta": grau_alerta, "pvp_risco": grau_caro, "vacancia_risco": grau_vacancia,
    }
    variaveis_recomendacao = {
        "nota": fs.nota, "alerta": fs.alerta, "pvp_risco": fs.pvp_risco, "vacancia_risco": fs.vacancia_risco,
    }
    desc_regra_reco, forca_regra_reco = regra_dominante(
        fs.regras_recomendacao_termos, fs.regras_recomendacao_desc, valores_recomendacao, variaveis_recomendacao
    )

    return {
        "Nota_Final": nota_final,
        "Qualidade_Liquidez": classify_liquity(row["Liquidez"], fs.liquidez),
        "Grau_Alerta_DY": grau_alerta,
        "Grau_Caro_PVP": grau_caro,
        "Grau_Vacancia_Alta": grau_vacancia,
        "Valor_Recomendacao": round(valor_recomendacao, 2),
        "Grau_Risco": round(graus_recomendacao["risco"], 3),
        "Grau_Analisar": round(graus_recomendacao["analisar"], 3),
        "Grau_Comprar": round(graus_recomendacao["comprar"], 3),
        "Recomendacao": rotulos[rotulo_recomendacao],
        "Regra_Dominante_Oportunidade": desc_regra_oport,
        "Forca_Regra_Oportunidade": forca_regra_oport,
        "Regra_Dominante_Recomendacao": desc_regra_reco,
        "Forca_Regra_Recomendacao": forca_regra_reco,
    }


def score_all_funds(df: pd.DataFrame, fs: FuzzySystem) -> pd.DataFrame:
    resultados = pd.DataFrame([score_estate(row, fs) for _, row in df.iterrows()])
    return pd.concat([df.reset_index(drop=True), resultados], axis=1)