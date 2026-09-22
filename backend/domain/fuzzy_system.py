"""Construção do sistema fuzzy Mamdani (2 estágios: oportunidade e recomendação).

Portado do main.py acadêmico original. A lógica fuzzy em si não muda —
só passou a viver isolada, sem qualquer referência a arquivos ou paths.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

from .constants import DY_MAXIMO, DY_MINIMO, LIQUIDEZ_MINIMA, PVP_MAXIMO, PVP_MINIMO, VACANCIA_MAXIMA

@dataclass
class FuzzySystem:
    dy: ctrl.Antecedent
    pvp: ctrl.Antecedent
    liquidez: ctrl.Antecedent
    vacancia: ctrl.Antecedent
    oportunidade: ctrl.Consequent
    nota: ctrl.Antecedent
    alerta: ctrl.Antecedent
    pvp_risco: ctrl.Antecedent
    vacancia_risco: ctrl.Antecedent
    recomendacao: ctrl.Consequent
    sistema_oportunidade: ctrl.ControlSystem
    sistema_recomendacao: ctrl.ControlSystem
    regras_oportunidade_desc: list[str]
    regras_recomendacao_desc: list[str]
    regras_oportunidade_termos: list[list[tuple[str, str]]]
    regras_recomendacao_termos: list[list[tuple[str, str]]]


def build_opportunity_variables():
    dy = ctrl.Antecedent(np.arange(DY_MINIMO, DY_MAXIMO + 0.0001, 0.0001), "dy")
    pvp = ctrl.Antecedent(np.arange(PVP_MINIMO, PVP_MAXIMO + 0.0001, 0.0001), "pvp")
    liquidez = ctrl.Antecedent(np.arange(LIQUIDEZ_MINIMA, 30_000_001, 1_000), "liquidez")
    vacancia = ctrl.Antecedent(np.arange(0, VACANCIA_MAXIMA + 0.0001, 0.0001), "vacancia")
    oportunidade = ctrl.Consequent(np.arange(0, 100.01, 0.1), "oportunidade")

    dy["baixo"] = fuzz.trapmf(dy.universe, [0.080, 0.080, 0.085, 0.093])
    dy["moderado"] = fuzz.trimf(dy.universe, [0.085, 0.095, 0.105])
    dy["bom"] = fuzz.trimf(dy.universe, [0.098, 0.108, 0.120])
    dy["alto"] = fuzz.trimf(dy.universe, [0.112, 0.125, 0.138])
    dy["muito_alto_alerta"] = fuzz.trapmf(dy.universe, [0.132, 0.140, 0.150, 0.150])

    pvp["otimo"] = fuzz.trapmf(pvp.universe, [0.80, 0.80, 0.83, 0.87])
    pvp["bom"] = fuzz.trimf(pvp.universe, [0.84, 0.89, 0.94])
    pvp["razoavel"] = fuzz.trimf(pvp.universe, [0.90, 0.95, 0.98])
    pvp["caro"] = fuzz.trapmf(pvp.universe, [0.96, 0.99, 1.00, 1.00])

    liquidez["aceitavel"] = fuzz.trapmf(liquidez.universe, [2_000_000, 2_000_000, 3_000_000, 5_000_000])
    liquidez["boa"] = fuzz.trimf(liquidez.universe, [4_000_000, 8_000_000, 12_000_000])
    liquidez["excelente"] = fuzz.trapmf(liquidez.universe, [10_000_000, 15_000_000, 30_000_000, 30_000_000])

    vacancia["baixa"] = fuzz.trapmf(vacancia.universe, [0, 0, 0.03, 0.06])
    vacancia["moderada"] = fuzz.trimf(vacancia.universe, [0.04, 0.08, 0.12])
    vacancia["alta"] = fuzz.trapmf(vacancia.universe, [0.10, 0.13, 0.15, 0.15])

    oportunidade["baixa"] = fuzz.trimf(oportunidade.universe, [0, 0, 40])
    oportunidade["media"] = fuzz.trimf(oportunidade.universe, [25, 50, 70])
    oportunidade["alta"] = fuzz.trimf(oportunidade.universe, [55, 75, 90])
    oportunidade["muito_alta"] = fuzz.trapmf(oportunidade.universe, [80, 92, 100, 100])

    return dy, pvp, liquidez, vacancia, oportunidade


def build_opportunity_rules(dy, pvp, liquidez, vacancia, oportunidade):
    especificacao = [
        (dy["baixo"] & pvp["otimo"], oportunidade["media"], "DY baixo E P/VP ótimo = Oportunidade média", [("dy", "baixo"), ("pvp", "otimo")]),
        (dy["baixo"], oportunidade["baixa"], "DY baixo = Oportunidade baixa", [("dy", "baixo")]),
        (pvp["caro"], oportunidade["baixa"], "P/VP caro = Oportunidade baixa", [("pvp", "caro")]),
        (dy["moderado"] & pvp["otimo"], oportunidade["alta"], "DY moderado E P/VP ótimo = Oportunidade alta", [("dy", "moderado"), ("pvp", "otimo")]),
        (dy["moderado"] & pvp["bom"], oportunidade["media"], "DY moderado E P/VP bom = Oportunidade média", [("dy", "moderado"), ("pvp", "bom")]),
        (dy["moderado"] & pvp["razoavel"], oportunidade["media"], "DY moderado E P/VP razoável = Oportunidade média", [("dy", "moderado"), ("pvp", "razoavel")]),
        (dy["bom"] & pvp["otimo"], oportunidade["muito_alta"], "DY bom E P/VP ótimo = Oportunidade muito alta", [("dy", "bom"), ("pvp", "otimo")]),
        (dy["bom"] & pvp["bom"], oportunidade["alta"], "DY bom E P/VP bom = Oportunidade alta", [("dy", "bom"), ("pvp", "bom")]),
        (dy["bom"] & pvp["razoavel"], oportunidade["media"], "DY bom E P/VP razoável = Oportunidade média", [("dy", "bom"), ("pvp", "razoavel")]),
        (dy["alto"] & pvp["otimo"], oportunidade["muito_alta"], "DY alto E P/VP ótimo = Oportunidade muito alta", [("dy", "alto"), ("pvp", "otimo")]),
        (dy["alto"] & pvp["bom"], oportunidade["media"], "DY alto E P/VP bom =  Oportunidade média", [("dy", "alto"), ("pvp", "bom")]),
        (dy["alto"] & pvp["razoavel"], oportunidade["baixa"], "DY alto E P/VP razoável = Oportunidade baixa", [("dy", "alto"), ("pvp", "razoavel")]),
        (dy["muito_alto_alerta"], oportunidade["baixa"], "DY muito alto (alerta) = Oportunidade baixa", [("dy", "muito_alto_alerta")]),
        (liquidez["boa"] & dy["bom"] & pvp["otimo"], oportunidade["muito_alta"], "Liquidez boa E DY bom E P/VP ótimo = Oportunidade muito alta",
            [("liquidez", "boa"), ("dy", "bom"), ("pvp", "otimo")]),
        (liquidez["excelente"] & dy["bom"] & pvp["bom"], oportunidade["muito_alta"], "Liquidez excelente E DY bom E P/VP bom = Oportunidade muito alta",
            [("liquidez", "excelente"), ("dy", "bom"), ("pvp", "bom")]),
        (vacancia["alta"], oportunidade["baixa"], "Vacância alta = Oportunidade baixa",
            [("vacancia", "alta")]),
        (vacancia["moderada"] & dy["baixo"], oportunidade["baixa"], "Vacância moderada E DY baixo = Oportunidade baixa",
            [("vacancia", "moderada"), ("dy", "baixo")]),
        (vacancia["moderada"] & pvp["caro"], oportunidade["baixa"], "Vacância moderada E P/VP caro = Oportunidade baixa",
            [("vacancia", "moderada"), ("pvp", "caro")]),
        (vacancia["moderada"] & dy["bom"] & pvp["otimo"], oportunidade["alta"], "Vacância moderada E DY bom E P/VP ótimo = Oportunidade alta",
            [("vacancia", "moderada"), ("dy", "bom"), ("pvp", "otimo")]),
        (vacancia["baixa"] & dy["bom"] & pvp["otimo"], oportunidade["muito_alta"], "Vacância baixa E DY bom E P/VP ótimo = Oportunidade muito alta",
            [("vacancia", "baixa"), ("dy", "bom"), ("pvp", "otimo")]),
    ]
    rules = [ctrl.Rule(antecedente, consequente) for antecedente, consequente, _, _ in especificacao]
    descricoes = [descricao for _, _, descricao, _ in especificacao]
    termos = [termos_regra for _, _, _, termos_regra in especificacao]
    return rules, descricoes, termos


def build_recommendation_variables():
    nota = ctrl.Antecedent(np.arange(0, 100.01, 0.1), "nota")
    alerta = ctrl.Antecedent(np.arange(0, 1.01, 0.01), "alerta")
    pvp_risco = ctrl.Antecedent(np.arange(0, 1.01, 0.01), "pvp_risco")
    vacancia_risco = ctrl.Antecedent(np.arange(0, 1.01, 0.01), "vacancia_risco")
    recomendacao = ctrl.Consequent(np.arange(0, 100.01, 0.1), "recomendacao")

    nota["baixa"] = fuzz.trapmf(nota.universe, [0, 0, 30, 45])
    nota["media"] = fuzz.trimf(nota.universe, [35, 55, 70])
    nota["alta"] = fuzz.trapmf(nota.universe, [60, 75, 100, 100])

    alerta["baixo"] = fuzz.trapmf(alerta.universe, [0, 0, 0.20, 0.40])
    alerta["medio"] = fuzz.trimf(alerta.universe, [0.25, 0.50, 0.75])
    alerta["alto"] = fuzz.trapmf(alerta.universe, [0.60, 0.80, 1.00, 1.00])

    pvp_risco["baixo"] = fuzz.trapmf(pvp_risco.universe, [0, 0, 0.20, 0.40])
    pvp_risco["medio"] = fuzz.trimf(pvp_risco.universe, [0.25, 0.50, 0.75])
    pvp_risco["alto"] = fuzz.trapmf(pvp_risco.universe, [0.60, 0.80, 1.00, 1.00])

    vacancia_risco["baixo"] = fuzz.trapmf(vacancia_risco.universe, [0, 0, 0.20, 0.40])
    vacancia_risco["medio"] = fuzz.trimf(vacancia_risco.universe, [0.25, 0.50, 0.75])
    vacancia_risco["alto"] = fuzz.trapmf(vacancia_risco.universe, [0.60, 0.80, 1.00, 1.00])

    recomendacao["risco"] = fuzz.trapmf(recomendacao.universe, [0, 0, 20, 40])
    recomendacao["analisar"] = fuzz.trimf(recomendacao.universe, [30, 50, 70])
    recomendacao["comprar"] = fuzz.trapmf(recomendacao.universe, [60, 80, 100, 100])

    return nota, alerta, pvp_risco, vacancia_risco, recomendacao


def build_recommendation_rules(nota, alerta, pvp_risco, vacancia_risco, recomendacao):
    especificacao = [
        (alerta["alto"], recomendacao["risco"], "Alerta de DY alto = Recomendação risco", [("alerta", "alto")]),
        (pvp_risco["alto"], recomendacao["risco"], "P/VP caro em grau alto = Recomendação risco", [("pvp_risco", "alto")]),
        (vacancia_risco["alto"], recomendacao["risco"], "Vacância alta em grau alto = Recomendação risco", [("vacancia_risco", "alto")]),
        (nota["baixa"], recomendacao["risco"], "Nota baixa = Recomendação risco", [("nota", "baixa")]),
        (nota["media"] & alerta["medio"], recomendacao["analisar"], "Nota média E alerta DY médio = Recomendação analisar", [("nota", "media"), ("alerta", "medio")]),
        (nota["media"] & pvp_risco["medio"], recomendacao["analisar"], "Nota média E alerta P/VP médio = Recomendação analisar", [("nota", "media"), ("pvp_risco", "medio")]),
        (nota["media"] & vacancia_risco["medio"], recomendacao["analisar"], "Nota média E alerta vacância médio = Recomendação analisar", [("nota", "media"), ("vacancia_risco", "medio")]),
        (nota["alta"] & alerta["medio"], recomendacao["analisar"], "Nota alta E alerta DY médio = Recomendação analisar", [("nota", "alta"), ("alerta", "medio")]),
        (nota["alta"] & pvp_risco["medio"], recomendacao["analisar"], "Nota alta E alerta P/VP médio = Recomendação analisar", [("nota", "alta"), ("pvp_risco", "medio")]),
        (nota["alta"] & vacancia_risco["medio"], recomendacao["analisar"], "Nota alta E alerta vacância médio = Recomendação analisar", [("nota", "alta"), ("vacancia_risco", "medio")]),
        (nota["alta"] & alerta["baixo"] & pvp_risco["baixo"] & vacancia_risco["baixo"], recomendacao["comprar"], "Nota alta E todos os alertas baixos = Recomendação comprar", [("nota", "alta"), ("alerta", "baixo"), ("pvp_risco", "baixo"), ("vacancia_risco", "baixo")]),
        (nota["media"] & alerta["baixo"] & pvp_risco["baixo"] & vacancia_risco["baixo"], recomendacao["analisar"], "Nota média E todos os alertas baixos = Recomendação analisar", [("nota", "media"), ("alerta", "baixo"), ("pvp_risco", "baixo"), ("vacancia_risco", "baixo")]),
        ((nota["alta"] | nota["media"]) & (alerta["medio"] | pvp_risco["medio"] | vacancia_risco["medio"]), recomendacao["analisar"], "Nota aceitável com alertas moderados = Recomendação analisar", [("nota", "media"), ("alerta", "medio")]),
    ]
    rules = [ctrl.Rule(antecedente, consequente) for antecedente, consequente, _, _ in especificacao]
    descricoes = [descricao for _, _, descricao, _ in especificacao]
    termos = [termos_regra for _, _, _, termos_regra in especificacao]
    return rules, descricoes, termos


def build_fuzzy_system() -> FuzzySystem:
    dy, pvp, liquidez, vacancia, oportunidade = build_opportunity_variables()
    opportunity_rules, opportunity_rules_desc, opportunity_rules_termos = build_opportunity_rules(
        dy, pvp, liquidez, vacancia, oportunidade
    )

    nota, alerta, pvp_risco, vacancia_risco, recomendacao = build_recommendation_variables()
    recommendation_rules, recommendation_rules_desc, recommendation_rules_termos = build_recommendation_rules(
        nota, alerta, pvp_risco, vacancia_risco, recomendacao
    )

    return FuzzySystem(
        dy=dy,
        pvp=pvp,
        liquidez=liquidez,
        vacancia=vacancia,
        oportunidade=oportunidade,
        nota=nota,
        alerta=alerta,
        pvp_risco=pvp_risco,
        vacancia_risco=vacancia_risco,
        recomendacao=recomendacao,
        sistema_oportunidade=ctrl.ControlSystem(opportunity_rules),
        sistema_recomendacao=ctrl.ControlSystem(recommendation_rules),
        regras_oportunidade_desc=opportunity_rules_desc,
        regras_recomendacao_desc=recommendation_rules_desc,
        regras_oportunidade_termos=opportunity_rules_termos,
        regras_recomendacao_termos=recommendation_rules_termos,
    )