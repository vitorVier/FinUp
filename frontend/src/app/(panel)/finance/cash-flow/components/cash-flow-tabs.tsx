"use client";

export type CashFlowTab = "overview" | "expenses" | "planning";

interface CashFlowTabsProps {
    activeTab: CashFlowTab;
    onChange: (tab: CashFlowTab) => void;
}

const TABS: { key: CashFlowTab; label: string }[] = [
    { key: "overview", label: "Visão geral" },
    { key: "expenses", label: "Despesas" },
    { key: "planning", label: "Planejamento" },
];

export function CashFlowTabs({
    activeTab,
    onChange,
}: CashFlowTabsProps) {
    return (
        <div className="flex w-fit items-center rounded-lg border bg-muted/40 p-1">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                        activeTab === tab.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
