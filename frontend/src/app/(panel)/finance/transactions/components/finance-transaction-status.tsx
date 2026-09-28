import {
    CheckCircle2,
    Clock3,
    XCircle,
} from "lucide-react";

import type { TransactionStatus } from "../page";

interface Props {
    status: TransactionStatus;
}

const STATUS = {
    PENDING: {
        label: "Previsto",
        className:
            "border-amber-200/80 bg-amber-500/10 text-amber-700",
        icon: Clock3,
    },
    CONFIRMED: {
        label: "Realizado",
        className:
            "border-emerald-200/80 bg-emerald-500/10 text-emerald-700",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Cancelado",
        className:
            "border-red-200/80 bg-red-500/10 text-red-700",
        icon: XCircle,
    },
} satisfies Record<
    TransactionStatus,
    {
        label: string;
        className: string;
        icon: typeof Clock3;
    }
>;

export function FinanceTransactionStatus({
    status,
}: Props) {
    const config = STATUS[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}