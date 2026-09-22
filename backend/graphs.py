from __future__ import annotations

import os
import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import main as sistema  # noqa: E402


GRAPHS_DIR = os.path.join(BASE_DIR, "output", "graphs")
DPI = 300

CORES = {
    "ruim": "#E74C3C",
    "atencao": "#E67E22",
    "neutro": "#7F8C8D",
    "bom": "#2E4053",
    "excelente": "#27AE60",
    "azul": "#3498DB",
    "texto": "#2C3E50",
    "grade": "#BDC3C7",
}

PALETA = {
    "dy": {"baixo": CORES["atencao"], "moderado": CORES["neutro"], "bom": CORES["bom"], "alto": CORES["azul"], "muito_alto_alerta": CORES["ruim"]},
    "pvp": {"otimo": CORES["excelente"], "bom": CORES["bom"], "razoavel": CORES["atencao"], "caro": CORES["ruim"]},
    "liquidez": {"aceitavel": CORES["neutro"], "boa": CORES["azul"], "excelente": CORES["excelente"]},
    "vacancia": {"baixa": CORES["excelente"], "moderada": CORES["atencao"], "alta": CORES["ruim"]},
    "nota": {"baixa": CORES["ruim"], "media": CORES["atencao"], "alta": CORES["excelente"]},
    "alerta": {"baixo": CORES["excelente"], "medio": CORES["atencao"], "alto": CORES["ruim"]},
    "pvp_risco": {"baixo": CORES["excelente"], "medio": CORES["atencao"], "alto": CORES["ruim"]},
    "vacancia_risco": {"baixo": CORES["excelente"], "medio": CORES["atencao"], "alto": CORES["ruim"]},
    "recomendacao": {"risco": CORES["ruim"], "analisar": CORES["atencao"], "comprar": CORES["excelente"]},
}


def configurar_eixos(ax, remover_spines: bool = True):
    ax.grid(True, alpha=0.28, color=CORES["grade"], linewidth=0.8, linestyle=":")
    ax.set_axisbelow(True)
    if remover_spines:
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)


def cor_termo(variavel: str, termo: str) -> str:
    return PALETA.get(variavel, {}).get(termo, CORES["neutro"])


def cor_nota(nota: float) -> str:
    if nota < 45:
        return CORES["ruim"]
    if nota < 70:
        return CORES["atencao"]
    return CORES["bom"]


def preparar_pasta():
    os.makedirs(GRAPHS_DIR, exist_ok=True)


def salvar_figura(fig, nome: str):
    caminho_png = os.path.join(GRAPHS_DIR, f"{nome}.png")
    caminho_svg = os.path.join(GRAPHS_DIR, f"{nome}.svg")
    fig.savefig(caminho_png, dpi=DPI, bbox_inches="tight")
    fig.savefig(caminho_svg, bbox_inches="tight")
    plt.close(fig)
    print(f"[GRÁFICO] {caminho_png}")


def grafico_1_funcoes_pertinencia(fs: sistema.FuzzySystem):
    """Mostra as quatro entradas do 1º estágio: DY, P/VP, liquidez e vacância."""
    fig, axes = plt.subplots(2, 2, figsize=(13.5, 9.5))
    axes = axes.flatten()

    configuracoes = [
        (axes[0], "dy", fs.dy, "Dividend Yield (DY)", "DY", {
            "baixo": "Baixo", "moderado": "Moderado", "bom": "Bom",
            "alto": "Alto", "muito_alto_alerta": "Muito alto / alerta",
        }),
        (axes[1], "pvp", fs.pvp, "Preço / Valor Patrimonial (P/VP)", "P/VP", {
            "otimo": "Ótimo", "bom": "Bom", "razoavel": "Razoável", "caro": "Caro",
        }),
        (axes[2], "liquidez", fs.liquidez, "Liquidez diária", "Liquidez (R$)", {
            "aceitavel": "Aceitável", "boa": "Boa", "excelente": "Excelente",
        }),
        (axes[3], "vacancia", fs.vacancia, "Vacância Média", "Vacância", {
            "baixa": "Baixa", "moderada": "Moderada", "alta": "Alta",
        }),
    ]

    for ax, chave, variavel, titulo, xlabel, nomes in configuracoes:
        for termo, rotulo in nomes.items():
            ax.plot(variavel.universe, variavel[termo].mf, linewidth=2.3,
                    color=cor_termo(chave, termo), label=rotulo)
        ax.set_title(titulo, fontsize=12.5, fontweight="bold", color=CORES["texto"], pad=10)
        ax.set_xlabel(xlabel)
        ax.set_ylabel("Grau de pertinência")
        ax.set_ylim(-0.02, 1.15)
        configurar_eixos(ax)
        ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.15), ncol=2, fontsize=8.5, frameon=False)

    axes[2].ticklabel_format(style="plain", axis="x")
    axes[2].tick_params(axis="x", labelrotation=20)
    axes[3].set_xlim(0, sistema.VACANCIA_MAXIMA)

    fig.suptitle(
        "1. Funções de pertinência das quatro entradas do 1º estágio",
        fontsize=16, fontweight="bold", color=CORES["texto"],
    )
    fig.text(
        0.5, 0.01,
        "A fuzzificação transforma DY, P/VP, liquidez e vacância em graus de pertinência entre 0 e 1.",
        ha="center", fontsize=10, color="#546E7A",
    )
    fig.tight_layout(rect=(0, 0.035, 1, 0.96))
    salvar_figura(fig, "01_funcoes_pertinencia")


def calcular_superficie(fs: sistema.FuzzySystem, df_triado: pd.DataFrame):
    """Nota_Final em função de DY e P/VP, com liquidez e vacância fixadas"""
    RESOLUCAO_SUPERFICIE = 45
    dy_vals = np.linspace(sistema.DY_MINIMO, sistema.DY_MAXIMO, RESOLUCAO_SUPERFICIE)
    pvp_vals = np.linspace(sistema.PVP_MINIMO, sistema.PVP_MAXIMO, RESOLUCAO_SUPERFICIE)
    X, Y = np.meshgrid(dy_vals, pvp_vals)
    Z = np.full_like(X, np.nan, dtype=float)

    liquidez_fixa = float(df_triado["Liquidez"].median())
    vacancia_fixa = min(float(df_triado["Vacância Média"].median()), sistema.VACANCIA_MAXIMA)

    sim = sistema.ctrl.ControlSystemSimulation(fs.sistema_oportunidade, cache=False)

    total = X.size
    processados = 0
    for i in range(Y.shape[0]):
        for j in range(X.shape[1]):
            try:
                sim.input["dy"] = float(X[i, j])
                sim.input["pvp"] = float(Y[i, j])
                sim.input["liquidez"] = liquidez_fixa
                sim.input["vacancia"] = vacancia_fixa
                sim.compute()
                Z[i, j] = float(sim.output["oportunidade"])
            except Exception:
                Z[i, j] = np.nan
            processados += 1
        print(f"[SUPERFÍCIE] {processados}/{total} pontos calculados", end="\r")
    print()

    return X, Y, Z, liquidez_fixa, vacancia_fixa


def grafico_1b_pertinencia_estagio2(fs: sistema.FuzzySystem):
    fig, axes = plt.subplots(2, 2, figsize=(13, 9))

    configuracoes = [
        (axes[0, 0], "nota", fs.nota, "Nota de Oportunidade (entrada)",
         {"baixa": "Baixa", "media": "Média", "alta": "Alta"}),
        (axes[0, 1], "alerta", fs.alerta, "Alerta de DY muito alto (entrada)",
         {"baixo": "Baixo", "medio": "Médio", "alto": "Alto"}),
        (axes[1, 0], "pvp_risco", fs.pvp_risco, "Alerta de P/VP caro (entrada)",
         {"baixo": "Baixo", "medio": "Médio", "alto": "Alto"}),
        (axes[1, 1], "vacancia_risco", fs.vacancia_risco, "Alerta de vacância alta (entrada)",
         {"baixo": "Baixo", "medio": "Médio", "alto": "Alto"}),
    ]

    for ax, chave, variavel, titulo, nomes in configuracoes:
        for termo, rotulo in nomes.items():
            ax.plot(variavel.universe, variavel[termo].mf, linewidth=2.2, color=cor_termo(chave, termo), label=rotulo)
        ax.set_title(titulo, fontsize=11, fontweight="bold")
        ax.set_ylabel("Grau de pertinência")
        ax.set_ylim(-0.02, 1.15)
        configurar_eixos(ax)
        ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.18), ncol=3, fontsize=8.5, frameon=False)

    axes[0, 0].set_xlabel("Nota (0-100)")
    axes[0, 1].set_xlabel("Grau de alerta (0-1)")
    axes[1, 0].set_xlabel("Grau de alerta (0-1)")
    axes[1, 1].set_xlabel("Grau de alerta (0-1)")

    fig.suptitle(
        "1b. Funções de pertinência das entradas do 2º estágio (Recomendação)",
        fontsize=14, fontweight="bold", y=1.0,
    )
    fig.text(
        0.5, 0.01,
        "A Nota de Oportunidade do 1º estágio é reaproveitada como entrada aqui, junto com os três graus de alerta.",
        ha="center", fontsize=10,
    )
    fig.tight_layout(rect=(0, 0.035, 1, 0.97))
    salvar_figura(fig, "01b_pertinencia_estagio2_recomendacao")


def grafico_2_superficie_decisao(X, Y, Z, liquidez_fixa: float, vacancia_fixa: float):
    """Superfície 3D DY x P/VP -> Nota de Oportunidade."""
    fig = plt.figure(figsize=(12, 9))
    ax = fig.add_subplot(111, projection="3d")

    superficie = ax.plot_surface(
        X, Y, Z, cmap="RdYlGn", vmin=0, vmax=100, edgecolor="none", alpha=0.88, antialiased=True,
    )

    ax.set_title(
        "2. Superfície de decisão fuzzy: DY × P/VP → Nota de Oportunidade",
        fontsize=15, fontweight="bold", pad=18,
    )
    ax.set_xlabel("Dividend Yield (DY)", labelpad=10)
    ax.set_ylabel("P/VP", labelpad=10)
    ax.set_zlabel("Nota de Oportunidade (0–100)", labelpad=10)
    ax.view_init(elev=28, azim=-130)

    cbar = fig.colorbar(superficie, ax=ax, shrink=0.65, pad=0.10)
    cbar.set_label("Nota de Oportunidade")

    fig.text(
        0.5, 0.02,
        (
            "Corte da superfície com liquidez e vacância fixadas nas medianas dos fundos após a triagem "
            f"(liquidez = R$ {liquidez_fixa:,.0f}; vacância = {vacancia_fixa:.1%})."
        ),
        ha="center", fontsize=9,
    )
    fig.tight_layout(rect=(0, 0.045, 1, 1))
    salvar_figura(fig, "02_superficie_decisao_3d")


def grafico_2b_heatmap_decisao(X, Y, Z, liquidez_fixa: float, vacancia_fixa: float):
    """Heatmap 2D do mesmo corte da superfície 3D, facilitando a leitura em apresentação."""
    fig, ax = plt.subplots(figsize=(11.5, 8.2))
    imagem = ax.imshow(
        Z, origin="lower", aspect="auto",
        extent=[X.min(), X.max(), Y.min(), Y.max()],
        cmap="RdYlGn", vmin=0, vmax=100, interpolation="bilinear",
    )

    ax.set_title(
        "2b. Heatmap da decisão fuzzy: DY × P/VP → Nota",
        fontsize=15, fontweight="bold", color=CORES["texto"], pad=14,
    )
    ax.set_xlabel("Dividend Yield (DY)")
    ax.set_ylabel("P/VP")
    configurar_eixos(ax)

    cbar = fig.colorbar(imagem, ax=ax, pad=0.02)
    cbar.set_label("Nota de Oportunidade (0–100)")

    ax.text(
        0.99, 0.02,
        f"Liquidez fixa: R$ {liquidez_fixa:,.0f}\nVacância fixa: {vacancia_fixa:.1%}",
        transform=ax.transAxes, ha="right", va="bottom", fontsize=9,
        bbox=dict(boxstyle="round,pad=0.35", fc="white", ec="none", alpha=0.88),
    )

    fig.text(
        0.5, 0.01,
        "Mesma parametrização da superfície 3D; verde indica maior oportunidade e vermelho, menor oportunidade.",
        ha="center", fontsize=10, color="#546E7A",
    )
    fig.tight_layout(rect=(0, 0.04, 1, 0.98))
    salvar_figura(fig, "02b_heatmap_decisao")


def _agrupar_por_proximidade(pontos: list[tuple[float, float]], limiar_x: float = 4.0, limiar_y: float = 0.08) -> list[list[int]]:
    """Agrupa pontos que ficariam visualmente colados no gráfico """
    grupos: list[list[int]] = []
    usados = [False] * len(pontos)
    for i, (xi, yi) in enumerate(pontos):
        if usados[i]:
            continue
        grupo = [i]
        usados[i] = True
        for j in range(i + 1, len(pontos)):
            if usados[j]:
                continue
            xj, yj = pontos[j]
            if abs(xi - xj) <= limiar_x and abs(yi - yj) <= limiar_y:
                grupo.append(j)
                usados[j] = True
        grupos.append(grupo)
    return grupos


def _offsets_em_leque(n: int, raio: float = 78.0) -> list[tuple[float, float]]:
    """Distribui `n` rótulos em leque acima do ponto, sem colidir entre si."""
    if n <= 0:
        return []
    if n == 1:
        return [(0.0, raio)]
    angulos = np.linspace(np.deg2rad(20), np.deg2rad(160), n)
    return [(float(raio * np.cos(a)), float(raio * np.sin(a))) for a in angulos]


def grafico_3_recomendacao_top10(df_ranked: pd.DataFrame, fs: sistema.FuzzySystem):
    top10 = df_ranked.head(10).copy()

    fig, ax = plt.subplots(figsize=(14, 8.5))

    termos = {"risco": "Risco", "analisar": "Analisar", "comprar": "Comprar"}
    for termo, rotulo in termos.items():
        ax.plot(
            fs.recomendacao.universe, fs.recomendacao[termo].mf,
            linewidth=2.5, color=cor_termo("recomendacao", termo),
            label=f"{rotulo} (função de pertinência)",
        )

    pontos: list[tuple[float, float]] = []
    for _, row in top10.iterrows():
        x = float(row["Valor_Recomendacao"])
        graus = {"Risco": float(row["Grau_Risco"]), "Analisar": float(row["Grau_Analisar"]), "Comprar": float(row["Grau_Comprar"])}
        y = max(graus.values())
        pontos.append((x, y))
        ax.scatter([x], [y], s=72, color=cor_nota(float(row["Nota_Final"])), edgecolor="white", linewidth=0.9, zorder=5)

    grupos = _agrupar_por_proximidade(pontos)
    for grupo in grupos:
        offsets = _offsets_em_leque(len(grupo))
        for offset, idx in zip(offsets, grupo):
            pos = idx + 1
            row = top10.iloc[idx]
            x, y = pontos[idx]
            ax.annotate(
                f"{pos}. {row['Papel']}",
                (x, y),
                xytext=offset,
                textcoords="offset points",
                fontsize=9.5,
                fontweight="bold",
                ha="center",
                va="center",
                bbox=dict(boxstyle="round,pad=0.3", fc="white", alpha=0.94, ec=cor_nota(float(row["Nota_Final"])), lw=0.9),
                arrowprops=dict(arrowstyle="-|>", color="#607D8B", alpha=0.75, linewidth=1.1, shrinkA=5, shrinkB=4),
                zorder=6,
            )

    ax.set_title("3. Pertinência da recomendação com os fundos do TOP10", fontsize=15, fontweight="bold", pad=25)
    ax.set_xlabel("Valor da Recomendação (0–100)", labelpad=10)
    ax.set_ylabel("Grau de pertinência", labelpad=10)
    ax.set_xlim(0, 100)
    ax.set_ylim(-0.05, 1.35)
    ax.grid(True, alpha=0.2, linestyle=":")
    ax.legend(loc="lower left", framealpha=0.9)

    fig.text(
        0.5, 0.01,
        "Os marcadores representam a saída desfuzzificada do segundo estágio. Rótulos agrupados por proximidade visual real e distribuídos em leque.",
        ha="center", fontsize=10, style="italic",
    )
    fig.tight_layout(rect=(0, 0.04, 1, 0.96))
    salvar_figura(fig, "03_pertinencia_recomendacao_top10")


def grafico_4_funil_triagem(log: dict):
    etapas = [
        ("Total inicial", int(log["total_inicial"])),
        ("Passam liquidez", int(log["passam_liquidez"])),
        ("Passam DY", int(log["passam_dy"])),
        ("Passam P/VP", int(log["passam_pvp"])),
        ("Passam vacância", int(log["passam_vacancia"])),
        ("Passam todos", int(log["passam_todos"])),
    ]
    nomes = [x[0] for x in etapas]
    valores = [x[1] for x in etapas]

    cores_funil = ["#1B4F72", "#21618C", "#2E86C1", "#5DADE2", "#85C1E9", CORES["excelente"]]

    fig, ax = plt.subplots(figsize=(12, 8))
    y = np.arange(len(nomes))
    ax.barh(y, valores, height=0.6, alpha=0.9, color=cores_funil)

    ax.set_yticks(y)
    ax.set_yticklabels(nomes, fontweight="bold", color=CORES["texto"])
    ax.invert_yaxis()
    ax.set_xlabel("Quantidade de FIIs")
    ax.set_title("4. Funil da Triagem de Ativos", fontsize=15, fontweight="bold", pad=15)
    configurar_eixos(ax)

    total = valores[0] if valores else 0
    ax.set_xlim(0, total * 1.18 if total else 1)

    for i, valor in enumerate(valores):
        percentual = (valor / total * 100) if total else 0
        ax.text(
            valor + total * 0.015, i, f"{valor} ativos ({percentual:.1f}%)",
            va="center", ha="left", fontsize=10.5, fontweight="bold", color=CORES["texto"],
        )

    fig.text(
        0.5, 0.01,
        "A triagem é uma barreira crisp (passa/não passa) executada antes do tratamento de inteligência fuzzy.",
        ha="center", fontsize=10, style="italic", color="#546E7A",
    )
    fig.tight_layout(rect=(0, 0.04, 1, 0.97))
    salvar_figura(fig, "04_funil_triagem")


def grafico_5_fuzzy_vs_rank_sum(df_ranked: pd.DataFrame):
    df = df_ranked.copy()
    x = df["Soma_Ranks_Simples"].astype(float)
    y = df["Nota_Final"].astype(float)

    fig, ax = plt.subplots(figsize=(12, 8))

    cores = [cor_nota(v) for v in y]
    ax.scatter(x, y, s=58, c=cores, alpha=0.72, edgecolor="white", linewidth=0.5, zorder=2)

    top10 = df.head(10)
    ax.scatter(
        top10["Soma_Ranks_Simples"], top10["Nota_Final"],
        s=108, facecolors="none", edgecolors=CORES["azul"], linewidths=1.7,
        label="TOP10 oficial", zorder=4,
    )

    if len(df) >= 2 and x.nunique() > 1:
        coef = np.polyfit(x, y, 1)
        x_linha = np.linspace(x.min(), x.max(), 200)
        ax.plot(
            x_linha, coef[0] * x_linha + coef[1], linestyle="--", linewidth=1.5,
            color=CORES["neutro"], label="Tendência linear", zorder=1,
        )

    ax.axvline(float(x.median()), color=CORES["grade"], linewidth=1, linestyle=":")
    ax.axhline(float(y.median()), color=CORES["grade"], linewidth=1, linestyle=":")

    for pos, (_, row) in enumerate(top10.iterrows(), start=1):
        ax.annotate(
            f"{pos}. {row['Papel']}",
            (row["Soma_Ranks_Simples"], row["Nota_Final"]),
            xytext=(7, 6), textcoords="offset points",
            fontsize=8.5, fontweight="bold", color=CORES["texto"],
            bbox=dict(boxstyle="round,pad=0.22", fc="white", ec=CORES["grade"], alpha=0.9),
        )

    ax.set_title("5. Comparação: lógica fuzzy × ranking simples", fontsize=15, fontweight="bold", color=CORES["texto"])
    ax.set_xlabel("Soma dos ranks DY + P/VP (menor = melhor)")
    ax.set_ylabel("Nota de Oportunidade fuzzy (maior = melhor)")
    ax.set_ylim(max(0, y.min() - 5), min(100, y.max() + 8))

    # Menor soma é melhor, então inverter o eixo deixa a região favorável à direita.
    if x.max() > x.min():
        ax.invert_xaxis()

    configurar_eixos(ax)
    ax.legend(loc="best", frameon=False)

    ax.text(0.98, 0.96, "Maior nota fuzzy", transform=ax.transAxes, ha="right", va="top", fontsize=9, color=CORES["bom"], fontweight="bold")
    ax.text(0.02, 0.06, "Menor nota fuzzy", transform=ax.transAxes, ha="left", va="bottom", fontsize=9, color=CORES["ruim"], fontweight="bold")

    fig.text(
        0.5, 0.01,
        "A posição dos pontos evidencia convergências e divergências entre o ranking crisp e a avaliação fuzzy; não cria um novo critério de seleção.",
        ha="center", fontsize=10, color="#546E7A",
    )
    fig.tight_layout(rect=(0, 0.04, 1, 0.97))
    salvar_figura(fig, "05_fuzzy_vs_rank_sum")


def main():
    preparar_pasta()

    df_triado, log = sistema.load_and_screen(sistema.INPUT_PATH)
    if df_triado.empty:
        print("Nenhum fundo passou pela triagem. Não é possível gerar os gráficos.")
        return

    fs = sistema.build_fuzzy_system()
    df_scored = sistema.score_all_funds(df_triado, fs)
    df_ranked = sistema.rank_funds(df_scored)

    print("\n=== GERANDO GRÁFICOS ===")
    grafico_1_funcoes_pertinencia(fs)
    grafico_1b_pertinencia_estagio2(fs)

    X, Y, Z, liquidez_fixa, vacancia_fixa = calcular_superficie(fs, df_triado)
    grafico_2_superficie_decisao(X, Y, Z, liquidez_fixa, vacancia_fixa)
    grafico_2b_heatmap_decisao(X, Y, Z, liquidez_fixa, vacancia_fixa)

    grafico_3_recomendacao_top10(df_ranked, fs)
    grafico_4_funil_triagem(log)
    grafico_5_fuzzy_vs_rank_sum(df_ranked)

    print(f"\nGráficos salvos em: {GRAPHS_DIR}")


if __name__ == "__main__":
    main()