import { Eye, Star, TrendingUp } from "lucide-react";

import {
    Card,
    CardContent,
} from "@/src/components/ui/card";

interface MyFundsStatsProps {
    total: number;
    wallet: number;
    watchlist: number;
}

export function MyFundsStats({
    total,
    wallet,
    watchlist,
}: MyFundsStatsProps) {
    const stats = [
        {
            label: "Total acompanhados",
            value: total,
            icon: TrendingUp,
            className: "bg-primary/10 text-primary",
        },
        {
            label: "Meus fundos",
            value: wallet,
            icon: Star,
            className: "bg-yellow-500/10 text-yellow-500",
            fill: true,
        },
        {
            label: "Watchlist",
            value: watchlist,
            icon: Eye,
            className: "bg-blue-500/10 text-blue-500",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Card key={stat.label}>
                        <CardContent className="flex items-center justify-between px-5 pt-4 pb-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {stat.label}
                                </p>

                                <p className="mt-1 text-2xl font-semibold tracking-tight">
                                    {stat.value}
                                </p>
                            </div>

                            <div
                                className={`grid h-10 w-10 place-items-center rounded-lg ${stat.className}`}
                            >
                                <Icon
                                    className="h-5 w-5"
                                    fill={stat.fill ? "currentColor" : "none"}
                                />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}