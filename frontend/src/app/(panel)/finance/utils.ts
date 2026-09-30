import type {
    Transaction,
    TransactionStatus,
} from "./types";

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