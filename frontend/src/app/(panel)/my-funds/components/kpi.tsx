import { UserFund } from "@/generated/prisma/browser";
import { Card, CardContent } from "@/src/components/ui/card";
import { Eye, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

export function Kpi() {
    const [wallet, setWallet] = useState<UserFund[]>([]);
    const [watchlist, setWatchlist] = useState<UserFund[]>([]);

    const total = wallet.length + watchlist.length;
    const uniqueTotal = new Set([
        ...wallet.map((fund) => fund.papel),
        ...watchlist.map((fund) => fund.papel),
    ]).size;

    return (
        <div className="w-full grid gap-4 sm:grid-cols-3">
            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Total acompanhados
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                            {uniqueTotal}
                        </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Meus fundos
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                            {wallet.length}
                        </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-yellow-500/10 text-yellow-500">
                        <Star className="h-5 w-5 fill-current" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Watchlist
                        </p>

                        <p className="mt-1 text-2xl font-semibold tracking-tight">
                            {watchlist.length}
                        </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Eye className="h-5 w-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}