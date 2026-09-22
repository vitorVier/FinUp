"use client";

import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    ExternalLink,
    Info,
    ShieldAlert,
    Target,
    TrendingUp,
    Trophy,
    Wallet,
    X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { RecommendationBadge } from "@/src/components/fii/recommendation-badge";
import { formatBRL, formatPct } from "@/src/lib/utils";

import type { Analysis, Fund } from "@/src/types";

interface FundDetailProps {
    fund: Fund;
    analysis: Analysis;
    onClose: () => void;
    onSelect: (fund: Fund) => void;
}

export function FundDetail({
    fund,
    analysis,
    onClose,
    onSelect,
}: FundDetailProps) {
    /*
     * ============================================================
     * DADOS DERIVADOS
     * ============================================================
     */

    const recomendacao = fund.Recomendacao;

    const cotacao = Number(fund.Cotação ?? 0);
    const precoMin = Number(fund.Preco_Alvo_Min ?? 0);
    const precoMax = Number(fund.Preco_Alvo_Max ?? 0);

    const precoMedio =
        precoMin > 0 && precoMax > 0
            ? (precoMin + precoMax) / 2
            : 0;

    const potencialMin =
        cotacao > 0 && precoMin > 0
            ? (precoMin / cotacao - 1) * 100
            : null;

    const potencialMax =
        cotacao > 0 && precoMax > 0
            ? (precoMax / cotacao - 1) * 100
            : null;

    const potencialMedio =
        cotacao > 0 && precoMedio > 0
            ? (precoMedio / cotacao - 1) * 100
            : null;

    /*
     * ============================================================
     * GRAUS FUZZY
     * ============================================================
     */

    const graus = [
        {
            label: "Comprar",
            valor: Number(fund.Grau_Comprar ?? 0),
            color: "bg-emerald-500",
            textColor: "text-emerald-600",
        },
        {
            label: "Analisar",
            valor: Number(fund.Grau_Analisar ?? 0),
            color: "bg-amber-500",
            textColor: "text-amber-600",
        },
        {
            label: "Risco alto",
            valor: Number(fund.Grau_Risco ?? 0),
            color: "bg-red-500",
            textColor: "text-red-600",
        },
    ].sort((a, b) => b.valor - a.valor);

    const maiorGrau = graus[0]?.valor ?? 0;
    const segundoGrau = graus[1]?.valor ?? 0;

    const confianca =
        Math.max(0, maiorGrau - segundoGrau);

    const dadosFuzzyDisponiveis =
        graus.some((item) => item.valor > 0);

    /* ALERTAS */

    const alertas = [
        {
            label: "DY excessivo",
            descricao: "Possível armadilha de yield",
            valor: Number(fund.Grau_Alerta_DY ?? 0),
        },
        {
            label: "P/VP elevado",
            descricao: "Preço relativo ao patrimônio",
            valor: Number(fund.Grau_Caro_PVP ?? 0),
        },
        {
            label: "Vacância elevada",
            descricao: "Pressão sobre geração de renda",
            valor: Number(fund.Grau_Vacancia_Alta ?? 0),
        },
    ];

    const alertasRelevantes = alertas.filter(
        (alerta) => alerta.valor >= 0.3
    );

    /* COMPARAÇÃO FUZZY × TRADICIONAL */

    const comparacao =
        analysis.comparacao_fuzzy_tradicional?.find(
            (item) => item.Papel === fund.Papel
        );

    const investidor10Url = `https://investidor10.com.br/fiis/${fund.Papel.toLowerCase()}/`;

    /* FFO YIELD */

    const ffoYield = (
        fund as Fund & {
            "FFO Yield"?: number;
        }
    )["FFO Yield"];

    const dividendYield = Number(
        fund["Dividend Yield"] ?? 0
    );

    const gapDividendo =
        ffoYield != null
            ? dividendYield - Number(ffoYield)
            : null;

    const dividendoInsustentavel =
        gapDividendo != null &&
        gapDividendo > 0.02;

    /* HELPERS VISUAIS */

    function getAlertColor(valor: number) {
        if (valor >= 0.6) {
            return {
                bar: "bg-red-500",
                text: "text-red-600",
            };
        }

        if (valor >= 0.3) {
            return {
                bar: "bg-amber-500",
                text: "text-amber-600",
            };
        }

        return {
            bar: "bg-emerald-500",
            text: "text-emerald-600",
        };
    }

    function getPotentialColor(value: number | null) {
        if (value == null) return "text-muted-foreground";
        return value >= 0
            ? "text-emerald-600"
            : "text-red-600";
    }

    return (
        <div className="flex max-h-[88vh] flex-col">
            {/* HEADER */}
            <div className="relative shrink-0 overflow-hidden border-b border-border/60 bg-background px-6 py-6 pr-12 sm:px-8 sm:pr-16">
                {/* Efeito de background sutil */}
                <div className="pointer-events-none absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">

                    {/* Coluna esquerda: Identidade */}
                    <div className="min-w-0 flex-1">
                        {/* Sobretítulo */}
                        <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                                Fundo Imobiliário
                            </span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="truncate text-xs font-medium text-muted-foreground">
                                {fund.Segmento}
                            </span>
                        </div>

                        {/* Título Principal */}
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            {fund.Papel}
                        </h2>

                        {/* Badges e Ações */}
                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                            <RecommendationBadge value={recomendacao} />

                            {/* Badge de Rank */}
                            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span>
                                    Rank <strong className="text-foreground">#{fund.Rank}</strong> de {analysis.ranking_completo?.length ?? "—"}
                                </span>
                            </div>

                            {/* Link Externo */}
                            <a
                                href={investidor10Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1 text-xs text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                            >
                                Investidor10
                                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO*/}

            <div className="overflow-y-auto px-6 py-6">

                {/* VISÃO GERAL*/}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric
                        label="Cotação"
                        value={formatBRL(cotacao)}
                    />

                    <Metric
                        label="Dividend Yield"
                        value={formatPct(dividendYield)}
                        highlight
                    />

                    <Metric
                        label="P/VP"
                        value={Number(fund["P/VP"] ?? 0).toFixed(2)}
                    />

                    <Metric
                        label="Nota fuzzy"
                        value={Number(
                            fund.Nota_Final ?? 0
                        ).toFixed(1)}
                    />

                </div>

                {/* PREÇO-ALVO */}
                <Card className="mt-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="h-4 w-4 text-primary" />
                            Valuation
                            <span className="text-xs font-light text-muted-foreground">— Faixa de preço-alvo</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        {/* Três preços: mín / atual / máx */}
                        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-muted/20">
                            <div className="px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Alvo mín.</p>
                                <p className="mt-1 text-base font-bold tabular-nums">
                                    {precoMin > 0 ? formatBRL(precoMin) : "—"}
                                </p>
                                {potencialMin != null && (
                                    <p className={`mt-0.5 text-[11px] font-medium ${getPotentialColor(potencialMin)}`}>
                                        {potencialMin >= 0 ? "+" : ""}{potencialMin.toFixed(1)}%
                                    </p>
                                )}
                            </div>

                            <div className="px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Cotação atual</p>
                                <p className="mt-1 text-base font-bold tabular-nums text-foreground">
                                    {cotacao > 0 ? formatBRL(cotacao) : "—"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">referência</p>
                            </div>

                            <div className="px-4 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Alvo máx.</p>
                                <p className="mt-1 text-base font-bold tabular-nums">
                                    {precoMax > 0 ? formatBRL(precoMax) : "—"}
                                </p>
                                {potencialMax != null && (
                                    <p className={`mt-0.5 text-[11px] font-medium ${getPotentialColor(potencialMax)}`}>
                                        {potencialMax >= 0 ? "+" : ""}{potencialMax.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Barra de posição */}
                        {precoMin > 0 && precoMax > 0 && precoMax !== precoMin && cotacao > 0 && (() => {
                            const faixa = precoMax - precoMin;
                            const posAtual = ((cotacao - precoMin) / faixa) * 100;

                            const precoMedio = (precoMin + precoMax) / 2;
                            const potencialAtualVsMedio = ((precoMedio - cotacao) / cotacao) * 100;

                            const pctVsMin = ((cotacao - precoMin) / cotacao) * 100;
                            const pctVsMax = ((precoMax - cotacao) / cotacao) * 100;

                            return (
                                <div className="space-y-3">
                                    {/* Potencial até o meio da faixa */}
                                    <div className="flex items-center gap-2">
                                        {potencialAtualVsMedio >= 0
                                            ? <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                                            : <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                                        }
                                        <span className={`text-sm font-semibold ${getPotentialColor(potencialAtualVsMedio)}`}>
                                            {potencialAtualVsMedio >= 0 ? "+" : ""}{potencialAtualVsMedio.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground">até o ponto médio da faixa</span>
                                    </div>

                                    {/* Barra gradiente */}
                                    <div className="relative px-1 pt-1">
                                        <div className="relative h-2 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500">
                                            {/* Marcador da cotação atual */}
                                            <div
                                                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                                                style={{ left: `${Math.min(100, Math.max(0, posAtual))}%` }}
                                            >
                                                <div className="h-4 w-4 rounded-full border-2 border-background bg-foreground shadow-md" />
                                                <div className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap">
                                                    <span className="rounded bg-foreground px-1.5 py-0.5 text-[9px] font-semibold text-background">
                                                        {posAtual < 50
                                                            ? `${pctVsMin >= 0 ? "+" : ""}${pctVsMin.toFixed(1)}% vs mín`
                                                            : `${pctVsMax >= 0 ? "+" : ""}${pctVsMax.toFixed(1)}% p/ máx`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Labels das extremidades */}
                                        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                                            <span className="font-medium">{formatBRL(precoMin)}</span>
                                            <span className="font-medium">{formatBRL(precoMax)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* ====================================================
                    TESE DO MODELO
                ==================================================== */}

                <Card className="mt-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            O que o modelo está dizendo
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">

                        {/* Regra dominante */}
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Regra dominante</p>
                                <span className="shrink-0 tabular-nums text-xs font-bold text-foreground">
                                    {(Number(fund.Forca_Regra_Oportunidade ?? 0) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-6">
                                {fund.Regra_Dominante_Oportunidade || "Não informado pelo modelo."}
                            </p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${Math.min(100, Number(fund.Forca_Regra_Oportunidade ?? 0) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Recomendação final */}
                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recomendação final</p>
                                <span className="shrink-0 tabular-nums text-xs font-bold text-foreground">
                                    {(Number(fund.Forca_Regra_Recomendacao ?? 0) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-6">
                                {fund.Regra_Dominante_Recomendacao || "O modelo não forneceu uma justificativa textual."}
                            </p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${Math.min(100, Number(fund.Forca_Regra_Recomendacao ?? 0) * 100)}%` }}
                                />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* ====================================================
                    CONFIANÇA DA DECISÃO
                ==================================================== */}

                {dadosFuzzyDisponiveis && (
                    <Card className="mt-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Confiança da decisão
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {graus.map((item) => (
                                <div key={item.label}>
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="tabular-nums text-muted-foreground">{(item.valor * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all ${item.color}`}
                                            style={{ width: `${Math.min(100, item.valor * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className={`rounded-lg border p-3 text-xs leading-relaxed ${confianca >= 0.3
                                ? "border-border bg-muted/20 text-muted-foreground"
                                : "border-amber-200/50 bg-amber-50/50 text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-400"
                                }`}>
                                {confianca >= 0.3
                                    ? "A recomendação dominante está relativamente bem separada das demais."
                                    : "A decisão está próxima entre duas categorias. O ativo merece análise adicional antes da decisão."}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ====================================================
                    RISCOS
                ==================================================== */}

                <Card className="mt-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldAlert className="h-4 w-4 text-primary" />
                            Pontos de atenção
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {alertasRelevantes.length === 0 ? (
                            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-medium">Nenhum alerta relevante identificado</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Os indicadores de risco não apresentaram grau elevado.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alertasRelevantes.map((alerta) => {
                                    const colors = getAlertColor(alerta.valor);
                                    return (
                                        <div key={alerta.label} className="rounded-lg border border-border bg-muted/20 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${colors.text}`} />
                                                    <div>
                                                        <p className="text-sm font-medium">{alerta.label}</p>
                                                        <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 tabular-nums text-sm font-bold ${colors.text}`}>
                                                    {(alerta.valor * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${colors.bar}`}
                                                    style={{ width: `${Math.min(100, alerta.valor * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ====================================================
                    SUSTENTABILIDADE DO DIVIDENDO
                ==================================================== */}

                {ffoYield != null && (
                    <Card className="mt-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="h-4 w-4 text-primary" />
                                Sustentabilidade do dividendo
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Metric label="Dividend Yield" value={formatPct(dividendYield)} />
                                <Metric label="FFO Yield" value={formatPct(Number(ffoYield))} />
                                <Metric
                                    label="Diferença"
                                    value={gapDividendo != null
                                        ? `${gapDividendo >= 0 ? "+" : ""}${(gapDividendo * 100).toFixed(1)} p.p.`
                                        : "—"}
                                    danger={dividendoInsustentavel}
                                />
                            </div>

                            <div className={`rounded-lg border p-3 text-xs leading-relaxed ${dividendoInsustentavel
                                ? "border-red-200/50 bg-red-50/50 text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400"
                                : "border-emerald-200/50 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                                }`}>
                                {dividendoInsustentavel
                                    ? "O DY está significativamente acima do FFO Yield. Isso pode indicar uma distribuição pouco sustentável."
                                    : "O DY está relativamente alinhado ao FFO Yield, sem sinal forte de distribuição acima da geração de caixa."}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ====================================================
                    FUZZY × TRADICIONAL
                ==================================================== */}

                {comparacao && (
                    <Card className="mt-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Info className="h-4 w-4 text-primary" />
                                Fuzzy × método tradicional
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-muted/20">
                                <div className="px-4 py-3 text-center">
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ranking tradicional</p>
                                    <p className="mt-1 text-2xl font-extrabold tabular-nums">#{comparacao.Rank_Tradicional}</p>
                                </div>
                                <div className="px-4 py-3 text-center">
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ranking fuzzy</p>
                                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-primary">#{comparacao.Rank_Fuzzy}</p>
                                </div>
                            </div>

                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {comparacao.Diferenca_Tradicional_vs_Fuzzy !== 0
                                    ? "O modelo fuzzy altera a posição deste fundo porque considera fatores adicionais além de DY e P/VP, como vacância e sinais de risco."
                                    : "Os dois métodos apresentam a mesma posição para este fundo, indicando convergência entre a avaliação tradicional e a fuzzy."}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* ====================================================
                    RESUMO PARA DECISÃO
                ==================================================== */}

                <Card className="mt-3 border-primary/20 bg-primary/[0.02]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Resumo para decisão</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Recomendação</p>
                                <p className="mt-1 text-sm font-bold">{recomendacao || "—"}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Cotação atual</p>
                                <p className="mt-1 text-sm font-bold tabular-nums">{formatBRL(cotacao)}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Potencial (médio)</p>
                                <p className={`mt-1 text-sm font-bold tabular-nums ${getPotentialColor(potencialMedio)}`}>
                                    {potencialMedio != null ? `${potencialMedio >= 0 ? "+" : ""}${potencialMedio.toFixed(1)}%` : "—"}
                                </p>
                            </div>
                            <div className="col-span-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Faixa-alvo</p>
                                <p className="mt-1 text-sm font-bold tabular-nums">
                                    {precoMin > 0 && precoMax > 0 ? `${formatBRL(precoMin)} — ${formatBRL(precoMax)}` : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Alertas</p>
                                <p className={`mt-1 text-sm font-bold ${alertasRelevantes.length > 0 ? "text-amber-600" : "text-emerald-600"
                                    }`}>
                                    {alertasRelevantes.length > 0 ? `${alertasRelevantes.length} identificado(s)` : "Nenhum"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-4 text-[11px] text-muted-foreground">
                    Fonte:{" "}
                    {analysis.fonte === "fundamentus"
                        ? "Fundamentus (scraping automático)"
                        : "planilha enviada manualmente"}.
                </p>

            </div>
        </div>
    );
}

/*
 * ================================================================
 * COMPONENTES AUXILIARES
 * ================================================================
 */

function Metric({
    label,
    value,
    highlight = false,
    danger = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
    danger?: boolean;
}) {
    return (
        <div className="rounded-xl border bg-card p-4">

            <p className="text-xs font-medium text-muted-foreground">
                {label}
            </p>

            <p
                className={`number mt-1 text-lg font-semibold ${danger
                    ? "text-red-600"
                    : highlight
                        ? "text-primary"
                        : ""
                    }`}
            >
                {value}
            </p>

        </div>
    );
}

function ComparisonBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border bg-muted/20 p-4">

            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold">
                {value}
            </p>

        </div>
    );
}

function DecisionRow({
    label,
    value,
    valueClassName = "",
}: {
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">

            <span className="text-muted-foreground">
                {label}
            </span>

            <strong className={`text-right ${valueClassName}`}>
                {value}
            </strong>

        </div>
    );
}