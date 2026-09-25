"use client";

import {
    AlertTriangle,
    BarChart3,
    GitCompareArrows,
    PieChart,
    TrendingUp,
} from "lucide-react";

import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    ZAxis,
    CartesianGrid,
    Line,
    ReferenceLine,
} from "recharts";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import type { Analysis, Fund } from "@/src/types";

type ComparisonPoint = {
    papel?: string;
    ticker?: string;
    PAPEL?: string;
    TICKER?: string;

    soma_ranks?: number;
    nota_final?: number;

    Rank?: number;
    rank?: number;
    RANK?: number;

    recomendacao?: string;
    Recomendacao?: string;
    RECOMENDACAO?: string;
};

function getTicker(item: ComparisonPoint) {
    return item.papel ?? item.ticker ?? item.PAPEL ?? item.TICKER ?? "FII";
}

function getRank(item: ComparisonPoint) {
    return item.Rank ?? item.rank ?? item.RANK;
}

function getRecommendation(item: ComparisonPoint) {
    return (
        item.recomendacao ??
        item.Recomendacao ??
        item.RECOMENDACAO ??
        ""
    );
}

function normalizeRecommendation(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/* CORES DAS RECOMENDAÇÕES */

const COLORS = {
    comprar: "#10b981",
    analisar: "#f59e0b",
    risco: "#ef4444",
    default: "#94a3b8",
};

function getRecommendationColor(
    recommendation: string
) {
    const normalized =
        normalizeRecommendation(recommendation);

    if (
        normalized.includes("comprar") ||
        normalized === "compra"
    ) {
        return COLORS.comprar;
    }

    if (
        normalized.includes("analisar") ||
        normalized.includes("analise")
    ) {
        return COLORS.analisar;
    }

    if (
        normalized.includes("risco alto") ||
        normalized.includes("risco_alto") ||
        normalized.includes("risco")
    ) {
        return COLORS.risco;
    }

    return COLORS.default;
}

/*
   CLASSIFICAÇÃO */

function getRecommendationType(item: ComparisonPoint) {
    const normalized = normalizeRecommendation(
        getRecommendation(item)
    );

    if (
        normalized.includes("comprar") ||
        normalized === "compra"
    ) {
        return "comprar";
    }

    if (
        normalized.includes("analisar") ||
        normalized.includes("analise")
    ) {
        return "analisar";
    }

    if (
        normalized.includes("risco alto") ||
        normalized.includes("risco_alto") ||
        normalized.includes("risco")
    ) {
        return "risco";
    }

    return "default";
}

function isTop10(item: ComparisonPoint) {
    const rank = getRank(item);

    return (
        typeof rank === "number" &&
        rank <= 10
    );
}

/* PONTO PERSONALIZADO */
function CustomPoint(props: any) {
    const {
        cx,
        cy,
        payload,
        fill,
    } = props;

    if (
        typeof cx !== "number" ||
        typeof cy !== "number" ||
        !payload
    ) {
        return null;
    }

    const item =
        payload as ComparisonPoint;

    const color =
        typeof fill === "string"
            ? fill
            : getRecommendationColor(
                getRecommendation(item)
            );

    const highlighted = isTop10(item);

    const ticker = getTicker(item);
    const rank = getRank(item);

    return (
        <g>
            {/* ANEL DO TOP 10 */}
            {highlighted && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={9}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                    opacity={0.9}
                />
            )}

            {/* PONTO */}
            <circle
                cx={cx}
                cy={cy}
                r={highlighted ? 5.5 : 4}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                opacity={
                    highlighted
                        ? 1
                        : 0.75
                }
            />

            {/* LABEL DO TOP 10*/}

            {highlighted && (
                <>
                    <rect
                        x={cx + 10}
                        y={cy - 13}
                        width={
                            ticker.length * 7 +
                            25
                        }
                        height={22}
                        rx={5}
                        fill="#ffffff"
                        stroke="#cbd5e1"
                    />

                    <text
                        x={cx + 18}
                        y={cy + 2}
                        fontSize={10}
                        fontWeight={700}
                        fill="#334155"
                    >
                        {rank != null
                            ? `${rank}. `
                            : ""}

                        {ticker}
                    </text>
                </>
            )}
        </g>
    );
}

/* TOOLTIP */

function CustomTooltip({
    active,
    payload,
}: any) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    const item =
        payload[0]?.payload as
        | ComparisonPoint
        | undefined;

    if (!item) {
        return null;
    }

    const recommendation =
        getRecommendation(item);

    const color =
        getRecommendationColor(
            recommendation
        );

    return (
        <div className="min-w-[210px] rounded-xl border bg-white p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">
                    {getTicker(item)}
                </span>

                {recommendation && (
                    <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                            color,
                            backgroundColor: `${color}15`,
                        }}
                    >
                        {recommendation}
                    </span>
                )}
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">
                        Soma dos ranks
                    </span>

                    <span className="font-semibold text-slate-800">
                        {item.soma_ranks?.toFixed(
                            0
                        )}
                    </span>
                </div>

                <div className="flex justify-between gap-6">
                    <span className="text-muted-foreground">
                        Nota fuzzy
                    </span>

                    <span className="font-semibold text-slate-800">
                        {item.nota_final?.toFixed(
                            1
                        )}
                    </span>
                </div>

                {getRank(item) != null && (
                    <div className="flex justify-between gap-6">
                        <span className="text-muted-foreground">
                            Rank
                        </span>

                        <span className="font-semibold text-slate-800">
                            #{getRank(item)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* LINHA DE TENDÊNCIA */
function calculateTrendLine(
    data: ComparisonPoint[]
) {
    const valid = data.filter(
        (item) =>
            typeof item.soma_ranks ===
            "number" &&
            typeof item.nota_final ===
            "number"
    );

    if (valid.length < 2) {
        return [];
    }

    const n = valid.length;

    const sumX = valid.reduce(
        (sum, item) =>
            sum +
            (item.soma_ranks ?? 0),
        0
    );

    const sumY = valid.reduce(
        (sum, item) =>
            sum +
            (item.nota_final ?? 0),
        0
    );

    const sumXY = valid.reduce(
        (sum, item) =>
            sum +
            (item.soma_ranks ?? 0) *
            (item.nota_final ?? 0),
        0
    );

    const sumX2 = valid.reduce(
        (sum, item) =>
            sum +
            Math.pow(
                item.soma_ranks ?? 0,
                2
            ),
        0
    );

    const denominator =
        n * sumX2 -
        Math.pow(sumX, 2);

    if (denominator === 0) {
        return [];
    }

    const slope =
        (n * sumXY -
            sumX * sumY) /
        denominator;

    const intercept =
        (sumY -
            slope * sumX) /
        n;

    const minX = Math.min(
        ...valid.map(
            (item) =>
                item.soma_ranks ?? 0
        )
    );

    const maxX = Math.max(
        ...valid.map(
            (item) =>
                item.soma_ranks ?? 0
        )
    );

    return [
        {
            soma_ranks: minX,
            nota_final:
                slope * minX +
                intercept,
        },
        {
            soma_ranks: maxX,
            nota_final:
                slope * maxX +
                intercept,
        },
    ];
}

/*MEDIANA */
function getMedian(values: number[]) {
    if (!values.length) {
        return 0;
    }

    const sorted = [...values].sort(
        (a, b) => a - b
    );

    const middle = Math.floor(
        sorted.length / 2
    );

    if (
        sorted.length % 2 ===
        0
    ) {
        return (
            (sorted[middle - 1] +
                sorted[middle]) /
            2
        );
    }

    return sorted[middle];
}

/*COMPONENTE PRINCIPAL */
function RecommendationDistribution({
    funds,
    top10,
    onSelect
}: {
    funds: Analysis["ranking_completo"];
    top10: Analysis["top10"];
    onSelect: (fund: Fund) => void;
}) {
    const total = funds.length;

    const comprar = funds.filter(
        (f) => f.Recomendacao === "Comprar"
    ).length;

    const analisar = funds.filter(
        (f) => f.Recomendacao === "Analisar"
    ).length;

    const risco = funds.filter(
        (f) => f.Recomendacao === "Risco Alto"
    ).length;

    const top10Papeis = new Set(
        top10.map((fund) => fund.Papel)
    );

    const outrasCompras = funds
        .filter(
            (fund) =>
                fund.Recomendacao === "Comprar" &&
                !top10Papeis.has(fund.Papel)
        )
        .sort(
            (a, b) =>
                b.Nota_Final - a.Nota_Final
        )
        .slice(0, 6);

    const percentual = (value: number) =>
        total > 0 ? Math.round((value / total) * 100) : 0;

    const items = [
        {
            label: "Comprar",
            value: comprar,
            percentage: percentual(comprar),
            color: "bg-emerald-500",
            text: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Analisar",
            value: analisar,
            percentage: percentual(analisar),
            color: "bg-amber-500",
            text: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Risco Alto",
            value: risco,
            percentage: percentual(risco),
            color: "bg-red-500",
            text: "text-red-600",
            bg: "bg-red-50",
        },
    ];

    const comprarPct = total > 0 ? (comprar / total) * 100 : 0;
    const analisarPct = total > 0 ? (analisar / total) * 100 : 0;

    const comprarEnd = comprarPct;
    const analisarEnd = comprarPct + analisarPct;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Distribuição das recomendações
                </CardTitle>

                <p className="text-xs text-muted-foreground">
                    Classificação dos fundos após a análise fuzzy.
                </p>
            </CardHeader>

            <CardContent>
                <div className="flex items-center gap-8">
                    {/* Donut */}
                    <div className="relative h-36 w-36 shrink-0">
                        <div
                            className="h-full w-full rounded-full"
                            style={{
                                background: `conic-gradient(
                                    rgb(16 185 129) 0% ${comprarEnd}%,
                                    rgb(245 158 11) ${comprarEnd}% ${analisarEnd}%,
                                    rgb(239 68 68) ${analisarEnd}% 100%
                                )`,
                            }}
                        />

                        <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-white">
                            <span className="text-2xl font-semibold tracking-tight text-slate-900">
                                {total}
                            </span>

                            <span className="text-[10px] text-muted-foreground">
                                fundos
                            </span>
                        </div>
                    </div>

                    {/* Legenda / métricas */}
                    <div className="min-w-0 flex-1 space-y-4">
                        {items.map((item) => (
                            <div key={item.label}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                                        />

                                        <span className="text-sm text-slate-700">
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold tabular-nums text-slate-900">
                                            {item.value}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                        style={{
                                            width: `${item.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight */}
                <div className="mt-8 rounded-lg border bg-slate-50/70 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Leitura do resultado
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {comprar > 0 ? (
                            <>
                                <span className="font-medium text-emerald-600">
                                    {comprar} fundos
                                </span>{" "}
                                foram classificados como oportunidade de
                                compra, enquanto{" "}
                                <span className="font-medium text-amber-600">
                                    {analisar + risco}
                                </span>{" "}
                                exigem análise adicional ou apresentam maior
                                risco.
                            </>
                        ) : (
                            <>
                                Nenhum fundo recebeu recomendação de compra
                                nesta execução do modelo.
                            </>
                        )}
                    </p>
                </div>

                {outrasCompras.length > 0 && (
                    <div className="mt-4 rounded-xl border bg-slate-50/50 p-4">
                        <div className="mb-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Outras oportunidades
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Fundos classificados como{" "}
                                <span className="font-medium text-emerald-600">
                                    Comprar
                                </span>{" "}
                                que ficaram fora do TOP 10.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {outrasCompras.map((fund) => (
                                <button
                                    key={fund.Papel}
                                    type="button"
                                    onClick={() => onSelect(fund)}
                                    className="group inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                                >
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                    <span>{fund.Papel}</span>

                                    <span className="text-xs text-muted-foreground">
                                        {fund.Nota_Final.toFixed(1)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function Diagnostics({
    analysis,
    onSelect,
}: {
    analysis: Analysis;
    onSelect: (fund: Fund) => void;
}) {
    const funnel =
        analysis.charts.funil_triagem;

    const comp =
        analysis.charts
            .fuzzy_vs_rank_sum as ComparisonPoint[];

    const enrichedComp: ComparisonPoint[] = comp.map((item) => {
        const ticker = getTicker(item);

        const fund = analysis.ranking_completo.find(
            (f) => f.Papel === ticker
        );

        return {
            ...item,
            recomendacao:
                item.recomendacao ??
                item.Recomendacao ??
                item.RECOMENDACAO ??
                fund?.Recomendacao ??
                "",
        };
    });

    const validComp =
        enrichedComp.filter(
            (item) =>
                typeof item.soma_ranks ===
                "number" &&
                typeof item.nota_final ===
                "number"
        );

    const comprarData =
        validComp.filter(
            (item) =>
                getRecommendationType(
                    item
                ) === "comprar"
        );

    const analisarData =
        validComp.filter(
            (item) =>
                getRecommendationType(
                    item
                ) === "analisar"
        );

    const riscoData =
        validComp.filter(
            (item) =>
                getRecommendationType(
                    item
                ) === "risco"
        );

    const defaultData =
        validComp.filter(
            (item) =>
                getRecommendationType(
                    item
                ) === "default"
        );

    const trendLine =
        calculateTrendLine(
            validComp
        );

    const xValues =
        validComp.map(
            (item) =>
                item.soma_ranks ?? 0
        );

    const yValues =
        validComp.map(
            (item) =>
                item.nota_final ?? 0
        );

    const medianX =
        getMedian(xValues);

    const medianY =
        getMedian(yValues);

    const minX = Math.min(
        ...xValues,
        0
    );

    const maxX = Math.max(
        ...xValues,
        10
    );

    const maxY = Math.max(
        ...yValues,
        10
    );

    const xPadding =
        Math.max(
            2,
            (maxX - minX) * 0.08
        );

    const top10Papeis = new Set(
        analysis.top10.map((fund) => fund.Papel)
    );

    const outrasCompras = analysis.ranking_completo
        .filter(
            (fund) =>
                fund.Recomendacao === "Comprar" &&
                !top10Papeis.has(fund.Papel)
        )
        .sort((a, b) => b.Nota_Final - a.Nota_Final)
        .slice(0, 6);

    return (
        <div className="grid gap-5 lg:grid-cols-2">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Funil de triagem
                    </CardTitle>

                    <p className="text-xs text-muted-foreground">
                        Evolução dos fundos ao longo dos filtros do modelo.
                    </p>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {funnel.map((item, index) => {
                            const total = Number(funnel[0]?.valor ?? 0);
                            const valor = Number(item.valor ?? 0);

                            const percentual =
                                total > 0
                                    ? Math.round((valor / total) * 100)
                                    : 0;

                            const anterior =
                                index > 0
                                    ? Number(funnel[index - 1]?.valor ?? 0)
                                    : total;

                            const retencao =
                                anterior > 0
                                    ? Math.round((valor / anterior) * 100)
                                    : 100;

                            const isLast =
                                index === funnel.length - 1;

                            return (
                                <div
                                    key={item.etapa}
                                    className="group"
                                >
                                    <div className="mb-1.5 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <div
                                                className={[
                                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                                                    isLast
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-slate-100 text-slate-500",
                                                ].join(" ")}
                                            >
                                                {index + 1}
                                            </div>

                                            <span
                                                className={[
                                                    "truncate text-sm",
                                                    isLast
                                                        ? "font-semibold text-slate-900"
                                                        : "text-slate-600",
                                                ].join(" ")}
                                            >
                                                {item.etapa}
                                            </span>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <span
                                                className={[
                                                    "text-sm font-semibold tabular-nums",
                                                    isLast
                                                        ? "text-primary"
                                                        : "text-slate-800",
                                                ].join(" ")}
                                            >
                                                {valor}
                                            </span>

                                            <span className="text-[11px] text-muted-foreground">
                                                ({percentual}%)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ml-8">
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={[
                                                    "h-full rounded-full transition-all duration-500",
                                                    isLast
                                                        ? "bg-primary"
                                                        : "bg-slate-400",
                                                ].join(" ")}
                                                style={{
                                                    width: `${Math.max(
                                                        percentual,
                                                        2
                                                    )}%`,
                                                }}
                                            />
                                        </div>

                                        {index > 0 && (
                                            <div className="mt-1 flex justify-between">
                                                <span className="text-[10px] text-muted-foreground">
                                                    Retenção nesta etapa
                                                </span>

                                                <span className="text-[10px] font-medium text-slate-500">
                                                    {retencao}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-4">
                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Fundos analisados
                            </p>

                            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                                {funnel[0]?.valor ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg bg-primary/5 p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Aprovados
                            </p>

                            <p className="mt-1 text-lg font-semibold tabular-nums text-primary">
                                {funnel[funnel.length - 1]?.valor ?? 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <RecommendationDistribution
                funds={analysis.ranking_completo}
                top10={analysis.top10}
                onSelect={onSelect}
            />

            {/* COMPARAÇÃO FUZZY × RANKING */}

            <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <GitCompareArrows className="h-4 w-4 text-primary" />

                                Lógica fuzzy × ranking simples
                            </CardTitle>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Convergências e divergências entre
                                o ranking tradicional e a avaliação fuzzy.
                            </p>
                        </div>

                        {/* LEGENDA */}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">

                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Comprar
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                Analisar
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                Risco alto
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full border-2 border-slate-500" />
                                TOP 10
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="relative h-[440px]">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <ScatterChart
                                margin={{
                                    top: 25,
                                    right: 45,
                                    bottom: 35,
                                    left: 15,
                                }}
                            >

                                {/* GRID */}

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                    vertical
                                    horizontal
                                />

                                {/* EIXO X */}
                                <XAxis
                                    type="number"
                                    dataKey="soma_ranks"
                                    name="Soma dos ranks"
                                    reversed
                                    domain={[
                                        Math.max(
                                            0,
                                            minX -
                                            xPadding
                                        ),
                                        maxX +
                                        xPadding,
                                    ]}
                                    tick={{
                                        fontSize: 11,
                                        fill: "#64748b",
                                    }}
                                    tickLine={false}
                                    axisLine={{
                                        stroke:
                                            "#cbd5e1",
                                    }}
                                    label={{
                                        value:
                                            "Soma dos ranks DY + P/VP  ·  menor = melhor",
                                        position:
                                            "insideBottom",
                                        offset: -20,
                                        fontSize: 11,
                                        fill: "#64748b",
                                    }}
                                />

                                {/* EIXO Y */}
                                <YAxis
                                    type="number"
                                    dataKey="nota_final"
                                    name="Nota fuzzy"
                                    domain={[
                                        0,
                                        Math.ceil(
                                            maxY +
                                            5
                                        ),
                                    ]}
                                    tick={{
                                        fontSize: 11,
                                        fill: "#64748b",
                                    }}
                                    tickLine={false}
                                    axisLine={{
                                        stroke:
                                            "#cbd5e1",
                                    }}
                                    label={{
                                        value:
                                            "Nota de oportunidade fuzzy  ·  maior = melhor",
                                        angle: -90,
                                        position:
                                            "insideLeft",
                                        offset: 0,
                                        fontSize: 11,
                                        fill: "#64748b",
                                    }}
                                />

                                <ZAxis
                                    range={[
                                        40,
                                        40,
                                    ]}
                                />

                                {/* MEDIANA X */}
                                {medianX > 0 && (
                                    <ReferenceLine
                                        x={medianX}
                                        stroke="#cbd5e1"
                                        strokeDasharray="4 4"
                                    />
                                )}

                                {/* MEDIANA Y */}
                                {medianY > 0 && (
                                    <ReferenceLine
                                        y={medianY}
                                        stroke="#cbd5e1"
                                        strokeDasharray="4 4"
                                    />
                                )}

                                {/* TOOLTIP*/}
                                <Tooltip
                                    content={
                                        <CustomTooltip />
                                    }
                                    cursor={{
                                        stroke:
                                            "#94a3b8",
                                        strokeDasharray:
                                            "4 4",
                                    }}
                                />

                                {/* LINHA DE TENDÊNCIA */}
                                {trendLine.length ===
                                    2 && (
                                        <Line
                                            data={
                                                trendLine
                                            }
                                            type="linear"
                                            dataKey="nota_final"
                                            stroke="#64748b"
                                            strokeWidth={
                                                2
                                            }
                                            strokeDasharray="7 5"
                                            dot={false}
                                            activeDot={
                                                false
                                            }
                                            isAnimationActive={
                                                false
                                            }
                                        />
                                    )}

                                {/* COMPRAR */}
                                <Scatter
                                    name="Comprar"
                                    data={
                                        comprarData
                                    }
                                    fill={
                                        COLORS.comprar
                                    }
                                    shape={
                                        <CustomPoint />
                                    }
                                />

                                {/* ANALISAR */}
                                <Scatter
                                    name="Analisar"
                                    data={
                                        analisarData
                                    }
                                    fill={
                                        COLORS.analisar
                                    }
                                    shape={
                                        <CustomPoint />
                                    }
                                />

                                {/* RISCO ALTO */}

                                <Scatter
                                    name="Risco alto"
                                    data={
                                        riscoData
                                    }
                                    fill={
                                        COLORS.risco
                                    }
                                    shape={
                                        <CustomPoint />
                                    }
                                />

                                {/* NÃO CLASSIFICADO */}
                                {defaultData.length >
                                    0 && (
                                        <Scatter
                                            name="Não classificado"
                                            data={
                                                defaultData
                                            }
                                            fill={
                                                COLORS.default
                                            }
                                            shape={
                                                <CustomPoint />
                                            }
                                        />
                                    )}

                            </ScatterChart>
                        </ResponsiveContainer>

                        {/* INDICADORES DE QUADRANTE */}
                        <div className="pointer-events-none absolute left-20 top-3 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                            Melhor combinação
                        </div>

                        <div className="pointer-events-none absolute bottom-14 right-8 rounded-md bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                            Menor oportunidade
                        </div>
                    </div>

                    {/* INDICADORES DE QUADRANTE */}
                    <div className="mt-3 grid gap-3 border-t pt-4 sm:grid-cols-3">

                        <div className="rounded-lg bg-emerald-50/70 p-3">
                            <p className="text-[11px] font-semibold text-emerald-700">
                                CONVERGÊNCIA
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                                Ranking tradicional e lógica
                                fuzzy apontam na mesma direção.
                            </p>
                        </div>

                        <div className="rounded-lg bg-amber-50/70 p-3">
                            <p className="text-[11px] font-semibold text-amber-700">
                                DIVERGÊNCIA
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-amber-900">
                                O fuzzy pode elevar ou reduzir
                                a prioridade de um fundo.
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold text-slate-600">
                                TENDÊNCIA
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-slate-700">
                                A linha pontilhada mostra a
                                relação geral entre os dois critérios.
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Quanto mais à esquerda e acima,
                        melhor tende a ser a combinação entre
                        ranking tradicional e nota fuzzy.
                    </p>
                </CardContent>
            </Card>

            {/* ROBUSTEZ  */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Robustez da defuzzificação
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-900">
                            Ainda não exposta pelo backend
                        </p>

                        <p className="mt-1 text-sm text-amber-800">
                            A API atual não retorna a comparação
                            entre métodos de defuzzificação.
                            O painel está preparado para receber
                            esse dado sem alterar a interface.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* REGRAS FUZZY */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Regras fuzzy
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">

                        {analysis.regras_fuzzy.map(
                            (r) => (
                                <div
                                    key={`${r.estagio}-${r.numero}`}
                                    className="rounded-lg border p-3 text-sm transition-colors hover:bg-slate-50"
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {r.estagio} · Regra{" "}
                                        {r.numero}
                                    </span>

                                    <p className="mt-1">
                                        {r.regra}
                                    </p>
                                </div>
                            )
                        )}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}