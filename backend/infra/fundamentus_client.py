"""Scraping de https://www.fundamentus.com.br/fii_resultado.php.

A página publica uma única tabela HTML com todos os FIIs, sem login e
sem paginação. Três cuidados são obrigatórios:

1. A página é servida em ISO-8859-1 (Latin-1) — decodificar como UTF-8
   corrompe os acentos.
2. Números vêm em formato pt-BR: "1.234.567,89", "12,34%", "-" para
   valor ausente.
3. Requisições sem User-Agent de navegador têm mais chance de ser
   bloqueadas.

Qualquer falha de rede, timeout ou mudança de layout deve virar
FundamentusIndisponivelError, que a API traduz em erro 502/503 — o
front então oferece o upload de xlsx como alternativa.
"""

from __future__ import annotations

import io

import pandas as pd
import requests

FII_RESULTADO_URL = "https://www.fundamentus.com.br/fii_resultado.php"
TIMEOUT_SEGUNDOS = 15
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

# Mapeia o nome da coluna como vem do Fundamentus -> nome padronizado
# usado no restante do sistema (mesmo nome que a planilha .xlsx original).
MAPA_COLUNAS = {
    "Papel": "Papel",
    "Segmento": "Segmento",
    "Cotação": "Cotação",
    "FFO Yield": "FFO Yield",
    "Dividend Yield": "Dividend Yield",
    "P/VP": "P/VP",
    "Valor de Mercado": "Valor de Mercado",
    "Liquidez": "Liquidez",
    "Qtd de imóveis": "Qtd de imóveis",
    "Preço do m2": "Preço do m2",
    "Aluguel por m2": "Aluguel por m2",
    "Cap Rate": "Cap Rate",
    "Vacância Média": "Vacância Média",
}

COLUNAS_PERCENTUAL = ["FFO Yield", "Dividend Yield", "Cap Rate", "Vacância Média"]
COLUNAS_NUMERICAS = [
    "Cotação", "P/VP", "Valor de Mercado", "Liquidez",
    "Qtd de imóveis", "Preço do m2", "Aluguel por m2",
]


class FundamentusIndisponivelError(Exception):
    """Scraping falhou (rede, timeout, layout mudou etc.) — usar upload como fallback."""


def _normalizar_numero_ptbr(valor: str) -> float | None:
    """'1.234,56' -> 1234.56 | '12,34%' -> 12.34 | '-' -> None"""
    if valor is None:
        return None
    texto = str(valor).strip()
    if texto in ("", "-", "nan", "None"):
        return None
    texto = texto.replace("%", "").strip()
    texto = texto.replace(".", "").replace(",", ".")
    try:
        return float(texto)
    except ValueError:
        return None


def _buscar_html() -> str:
    try:
        resposta = requests.get(FII_RESULTADO_URL, headers=HEADERS, timeout=TIMEOUT_SEGUNDOS)
        resposta.raise_for_status()
    except requests.RequestException as exc:
        raise FundamentusIndisponivelError(f"Falha ao acessar o Fundamentus: {exc}") from exc

    # Encoding correto: o site é Latin-1, não UTF-8.
    resposta.encoding = "ISO-8859-1"
    return resposta.text


def _parsear_tabela(html: str) -> pd.DataFrame:
    try:
        tabelas = pd.read_html(io.StringIO(html), thousands=".", decimal=",")
    except ValueError as exc:
        raise FundamentusIndisponivelError(
            "Não foi possível localizar a tabela de FIIs na página (layout pode ter mudado)."
        ) from exc

    if not tabelas:
        raise FundamentusIndisponivelError("Nenhuma tabela encontrada na página do Fundamentus.")

    return tabelas[0]


def _normalizar_dataframe(df_bruto: pd.DataFrame) -> pd.DataFrame:
    df = df_bruto.copy()
    df.columns = [str(c).strip() for c in df.columns]

    colunas_faltantes = [c for c in MAPA_COLUNAS if c not in df.columns]
    if colunas_faltantes:
        raise FundamentusIndisponivelError(
            f"Colunas esperadas não encontradas na página do Fundamentus: {colunas_faltantes}. "
            "O layout do site provavelmente mudou."
        )

    df = df.rename(columns=MAPA_COLUNAS)

    # pd.read_html com thousands="." e decimal="," já deixa boa parte numérica,
    # mas colunas percentuais chegam como texto ("12,34%") e precisam do
    # tratamento manual. Checar dtype == object não é confiável: versões
    # recentes do pandas podem usar um dtype "str" dedicado em vez do
    # numpy object clássico — por isso usamos is_numeric_dtype.
    for coluna in COLUNAS_PERCENTUAL:
        if pd.api.types.is_numeric_dtype(df[coluna]):
            df[coluna] = df[coluna].astype(float) / 100.0
        else:
            df[coluna] = df[coluna].map(_normalizar_numero_ptbr) / 100.0

    for coluna in COLUNAS_NUMERICAS:
        if not pd.api.types.is_numeric_dtype(df[coluna]):
            df[coluna] = df[coluna].map(_normalizar_numero_ptbr)

    return df


def fetch_fii_resultado() -> pd.DataFrame:
    """Busca e normaliza a tabela de FIIs do Fundamentus.

    Retorna um DataFrame com as mesmas colunas/unidades esperadas pelo
    domínio (DY e Vacância Média como fração 0-1, não percentual).
    Levanta FundamentusIndisponivelError em qualquer falha — trate isso
    na camada de API oferecendo o upload como alternativa.
    """
    html = _buscar_html()
    df_bruto = _parsear_tabela(html)
    return _normalizar_dataframe(df_bruto)