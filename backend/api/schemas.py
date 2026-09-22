from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class LogTriagem(BaseModel):
    total_inicial: int
    passam_liquidez: int
    passam_dy: int
    passam_pvp: int
    passam_vacancia: int
    passam_todos: int


class AnaliseResponse(BaseModel):
    fonte: str
    log_triagem: LogTriagem
    top10: list[dict[str, Any]]
    ranking_completo: list[dict[str, Any]]
    comparacao_fuzzy_tradicional: list[dict[str, Any]]
    regras_fuzzy: list[dict[str, Any]]
    charts: dict[str, Any]


class ErroResponse(BaseModel):
    detail: str