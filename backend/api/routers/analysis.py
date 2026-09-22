"""Rotas de análise.

POST /analysis/run          -> busca dados no Fundamentus (scraping) e analisa
POST /analysis/run-upload   -> recebe um .xlsx e analisa

Nenhuma das duas grava arquivo em disco — tudo acontece em memória e a
resposta já sai pronta para o front consumir (tabelas + dados de gráfico).
"""

from __future__ import annotations

import io

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from domain.screening import ColunasFaltantesError
from infra.fundamentus_client import FundamentusIndisponivelError, fetch_fii_resultado
from services.analysis_service import SemFundosAposTriagemError, run_analysis

from ..schemas import AnaliseResponse

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/run", response_model=AnaliseResponse)
def run_from_fundamentus():
    try:
        df = fetch_fii_resultado()
    except FundamentusIndisponivelError as exc:
        # 502: a culpa é da fonte externa, não do cliente. O front deve
        # reagir mostrando a opção de upload como alternativa.
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return _rodar_e_tratar_erros(df, fonte="fundamentus")


@router.post("/run-upload", response_model=AnaliseResponse)
async def run_from_upload(arquivo: UploadFile = File(...)):
    if not arquivo.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Envie um arquivo .xlsx ou .xls.")

    conteudo = await arquivo.read()
    try:
        df = pd.read_excel(io.BytesIO(conteudo))
    except Exception as exc:  # arquivo corrompido, formato inesperado etc.
        raise HTTPException(status_code=400, detail=f"Não foi possível ler a planilha: {exc}") from exc

    return _rodar_e_tratar_erros(df, fonte="upload")


def _rodar_e_tratar_erros(df: pd.DataFrame, fonte: str) -> dict:
    try:
        return run_analysis(df, fonte=fonte)
    except ColunasFaltantesError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except SemFundosAposTriagemError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc