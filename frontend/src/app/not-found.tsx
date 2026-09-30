import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="w-full max-w-md text-center">
                {/* Ícone */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#053032]/10">
                    <SearchX className="h-7 w-7 text-[#053032]" />
                </div>

                {/* Código */}
                <p className="mt-7 text-sm font-semibold tracking-wide text-[#053032]">
                    ERRO 404
                </p>

                {/* Título */}
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    Página não encontrada
                </h1>

                {/* Descrição */}
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    A página que você está procurando não existe ou foi
                    removida. Verifique o endereço ou volte para a página
                    inicial.
                </p>

                {/* Ações */}
                <div className="mt-7 flex items-center justify-center gap-2">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#053032] px-4 text-sm font-medium text-white transition-colors hover:bg-[#053032]/90"
                    >
                        <Home className="h-4 w-4" />
                        Página inicial
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                </div>

                {/* Identificação discreta */}
                <p className="mt-10 text-[11px] text-muted-foreground/70">
                    Verifique a URL e tente novamente.
                </p>
            </div>
        </main>
    );
}