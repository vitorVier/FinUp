"use client";

import { BarChart3, LineChartIcon, LogOut, RefreshCw, WalletCards } from "lucide-react";
import { signOut, useSession } from "next-auth/react"; // Importamos o useSession
import { Button } from "./ui/button";

export function NavigationHeader({
  loading,
  run,
  page,
  setPage,
}: {
  loading: boolean;
  run: () => void;
  page: "analise" | "diagnostico";
  setPage: (page: "analise" | "diagnostico") => void;
}) {
  // Buscamos os dados do usuário logado de forma automática
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background px-5">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
            <WalletCards className="h-4 w-4" />
          </div>

          <div className="min-w-0 leading-none">
            <span className="block truncate text-sm font-bold tracking-tight text-foreground">
              FII Fuzzy
            </span>
            <span className="hidden text-[10px] text-slate-400 sm:block">
              Análise quantitativa
            </span>
          </div>
        </div>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => setPage("analise")}
            className={`flex h-9 items-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors ${
              page === "analise"
                ? "border border-border text-foreground"
                : "border border-transparent text-slate-400 hover:text-foreground"
            }`}
          >
            <LineChartIcon className="h-3.5 w-3.5" />
            Análise
          </button>

          <button
            type="button"
            onClick={() => setPage("diagnostico")}
            className={`flex h-9 items-center gap-1.5 rounded px-3 text-xs font-semibold transition-colors ${
              page === "diagnostico"
                ? "border border-border text-foreground"
                : "border border-transparent text-slate-400 hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Diagnóstico
          </button>
        </nav>

        <div className="flex items-center gap-1">
          {/* Se o usuário ESTIVER logado, mostra a foto e o botão de Sair */}
          {user ? (
            <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
              {user.image ? (
                <img src={user.image} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <span className="hidden text-xs font-medium text-foreground max-w-[100px] truncate md:block">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sair"
                className="flex h-9 items-center gap-1.5 rounded px-2 text-xs text-slate-400 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* Se o usuário NÃO estiver logado, mostra o botão de Entrar */
            <div className="ml-1 border-l border-border pl-3">
              <Button
                size="sm"
                onClick={() => window.location.href = "/login"} 
                className="h-8 text-xs font-semibold px-4"
              >
                Entrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
