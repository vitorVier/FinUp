"use client";

import logoImg from '../../public/logo.png'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    LineChartIcon,
    LogOut,
    WalletCards,
    WalletIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button } from "./ui/button";
import Image from 'next/image';

const NAV_ITEMS = [
    {
        href: "/",
        label: "Análise",
        icon: LineChartIcon,
    },
    {
        href: "/diagnostico",
        label: "Diagnóstico",
        icon: BarChart3,
    },
    {
        href: "/my-funds",
        label: "Meus Fundos",
        icon: WalletIcon,
    },
] as const;

export function NavigationHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
            <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5"
                >
                    <Image
                        src={logoImg}
                        alt='Logo do app'
                        width={115}
                        height={115}
                        priority
                        quality={100}
                    />
                </Link>

                {/* Navegação */}
                <nav
                    aria-label="Navegação principal"
                    className="hidden h-full items-center gap-6 sm:flex"
                >
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const active =
                            href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                                    relative flex h-full items-center gap-2
                                    text-[13px] font-medium
                                    transition-colors
                                    ${active
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }
                                `}
                            >
                                <Icon
                                    className={`
                                        h-4 w-4
                                        ${active
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                        }
                                    `}
                                    strokeWidth={1.8}
                                />

                                {label}

                                {active && (
                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Usuário */}
                <div className="flex items-center">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right md:block">
                                <p className="max-w-[120px] truncate text-xs font-medium text-foreground">
                                    {user.name}
                                </p>

                                <p className="text-[10px] text-muted-foreground">
                                    Conta
                                </p>
                            </div>

                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-border">
                                    {user.name
                                        ? user.name
                                            .charAt(0)
                                            .toUpperCase()
                                        : "U"}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    signOut({ callbackUrl: "/" })
                                }
                                title="Sair"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                            >
                                <LogOut
                                    className="h-4 w-4"
                                    strokeWidth={1.8}
                                />
                            </button>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (window.location.href = "/login")}
                            className="h-9 gap-2 rounded-md border-border bg-background px-4 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.75z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M6.54 13.85A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.26.31-1.85V7.64H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.51z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 6.12c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.2 14.63 2.25 12 2.25A9.74 9.74 0 0 0 3.3 7.64l3.24 2.51C7.31 7.84 9.46 6.12 12 6.12z"
                                />
                            </svg>

                            <span>Entrar com Google</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}