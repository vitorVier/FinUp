import { Eye, Star } from "lucide-react";

export type FundListTab = "wallet" | "watchlist";

interface MyFundsTabsProps {
    activeTab: FundListTab;
    walletCount: number;
    watchlistCount: number;
    onChange: (tab: FundListTab) => void;
}

export function MyFundsTabs({
    activeTab,
    walletCount,
    watchlistCount,
    onChange,
}: MyFundsTabsProps) {
    return (
        <div className="flex w-fit items-center rounded-lg border bg-muted/40 p-1">
            <button
                type="button"
                onClick={() => onChange("wallet")}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                    activeTab === "wallet"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <Star
                    className={`h-4 w-4 ${
                        activeTab === "wallet"
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                    }`}
                />

                Meus Fundos

                <span className="text-xs text-muted-foreground">
                    {walletCount}
                </span>
            </button>

            <button
                type="button"
                onClick={() => onChange("watchlist")}
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                    activeTab === "watchlist"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <Eye
                    className={`h-4 w-4 ${
                        activeTab === "watchlist"
                            ? "text-blue-500"
                            : ""
                    }`}
                />

                Watchlist

                <span className="text-xs text-muted-foreground">
                    {watchlistCount}
                </span>
            </button>
        </div>
    );
}