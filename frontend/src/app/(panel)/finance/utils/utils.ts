import type {
    Transaction,
    TransactionStatus,
} from "../types";

export function toNumber(
    value: number | string | null | undefined
) {
    if (value == null) return 0;

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


export function formatDate(date: string) {
    const current = new Date(date);

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    }).format(current);
}

export function formatInputCurrency(value: string): string {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
        return "0,00";
    }

    const number = Number(digits) / 100;

    return number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}


export function isSameMonth(
    date: string,
    year: number,
    month: number
) {
    const current = new Date(date);

    if (Number.isNaN(current.getTime())) {
        return false;
    }

    return (
        current.getFullYear() === year &&
        current.getMonth() === month
    );
}

export function getMonthRange(
    year: number,
    month: number
) {
    const start = new Date(
        year,
        month,
        1
    );

    const end = new Date(
        year,
        month + 1,
        0
    );

    return {
        start,
        end,
    };
}

export function getTransactionAmount(
    transaction: Transaction
) {
    return toNumber(
        transaction.value
    );
}

export function isPending(
    transaction: Transaction
) {
    return (
        transaction.status ===
        "PENDING"
    );
}

export function isConfirmed(
    transaction: Transaction
) {
    return (
        transaction.status ===
        "CONFIRMED"
    );
}

export function isCancelled(
    transaction: Transaction
) {
    return (
        transaction.status ===
        "CANCELLED"
    );
}

export function isOverdue(
    transaction: Transaction
) {
    if (
        transaction.status !==
        "PENDING"
    ) {
        return false;
    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const date = new Date(
        `${transaction.date}T00:00:00`
    );

    return date < today;
}

export function getStatusLabel(
    status: TransactionStatus
) {
    switch (status) {
        case "CONFIRMED":
            return "Realizado";

        case "PENDING":
            return "Previsto";

        case "CANCELLED":
            return "Cancelado";
    }
}

export function generateCategoryColor(
    type: "INFLOW" | "OUTFLOW",
    existingColors: string[] = []
): string {
    const goldenRatio = 0.618033988749895;
    let index = existingColors.length;

    while (true) {
        let hue: number;

        if (type === "OUTFLOW") {
            // Vermelho → laranja → amarelo
            const outflowHues = [
                0,
                15,
                30,
                45,
                55,
            ];

            hue =
                outflowHues[
                index % outflowHues.length
                ] +
                Math.floor(
                    index / outflowHues.length
                ) *
                7;
        } else {
            // Verde → azul → ciano
            const inflowHues = [
                140,
                160,
                180,
                200,
                220,
            ];

            hue =
                inflowHues[
                index % inflowHues.length
                ] +
                Math.floor(
                    index / inflowHues.length
                ) *
                7;
        }

        hue %= 360;

        const color = hslToHex(
            hue,
            65,
            55
        );

        if (!existingColors.includes(color)) {
            return color;
        }

        index++;
    }
}

function hslToHex(
    h: number,
    s: number,
    l: number
): string {
    s /= 100;
    l /= 100;

    const k = (n: number) =>
        (n + h / 30) % 12;

    const a = s * Math.min(l, 1 - l);

    const f = (n: number) =>
        l -
        a *
        Math.max(
            -1,
            Math.min(
                k(n) - 3,
                Math.min(9 - k(n), 1)
            )
        );

    return (
        "#" +
        [f(0), f(8), f(4)]
            .map((value) =>
                Math.round(255 * value)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
}

/**
 * Gera uma cor consistente para uma categoria baseada no seu nome.
 * Garante que a mesma categoria sempre terá a mesma cor em qualquer gráfico.
 * Saídas recebem tons quentes (vermelho, laranja, âmbar).
 * Entradas recebem tons de verde/esmeralda (seguindo o padrão do sistema).
 */
export function getCategoryColorByName(
    name: string,
    type: "INFLOW" | "OUTFLOW"
): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const positiveHash = Math.abs(hash);

    if (type === "OUTFLOW") {
        // Hues for expenses: Red, Orange, Amber (approx 340 to 40 degrees)
        const hues = [340, 350, 0, 10, 20, 30, 40];
        const hue = hues[positiveHash % hues.length];
        
        // Saturation: 70% to 85%
        const saturation = 70 + (positiveHash % 15);
        
        // Lightness: 50% to 65%
        const lightness = 50 + (positiveHash % 15);
        
        return `hsl(${hue} ${saturation}% ${lightness}%)`;
    } else {
        // Hues for incomes: Green, Emerald, Teal (approx 130 to 180 degrees)
        const hues = [130, 145, 155, 165, 180];
        const hue = hues[positiveHash % hues.length];
        
        // Saturation: 65% to 80%
        const saturation = 65 + (positiveHash % 15);
        
        // Lightness: 40% to 55% (slightly darker for better contrast)
        const lightness = 40 + (positiveHash % 15);
        
        return `hsl(${hue} ${saturation}% ${lightness}%)`;
    }
}