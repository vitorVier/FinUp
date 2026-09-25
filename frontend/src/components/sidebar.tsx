"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    LineChartIcon,
    LogOut,
    WalletIcon,
    Menu,
    X,
    WalletCards,
    Landmark,
    Receipt,
    PiggyBank,
    Target,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

import logoImg from "../../public/logo.png";

const NAV_GROUPS = [
    {
        label: "FII's",
        items: [
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
        ],
    },
    {
        label: "Financeiro",
        items: [
            {
                href: "/financeiro",
                label: "Visão geral",
                icon: Landmark,
            },
            {
                href: "/financeiro/lancamentos",
                label: "Lançamentos",
                icon: Receipt,
            },
            {
                href: "/financeiro/orcamentos",
                label: "Orçamentos",
                icon: PiggyBank,
            },
            {
                href: "/financeiro/metas",
                label: "Metas",
                icon: Target,
            },
        ],
    },
] as const;

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-[#052b2b] text-white">
            {/* Logo */}
            <div className="flex h-[88px] shrink-0 items-center px-6 pt-6">
                <Link
                    href="/"
                    className="flex items-center transition-opacity hover:opacity-90"
                >
                    <Image
                        src={logoImg}
                        alt="FinUp"
                        width={130}
                        height={130}
                        priority
                        quality={100}
                        className="object-contain"
                    />
                </Link>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-7">

                    {NAV_GROUPS.map((group) => (
                        <div key={group.label}>

                            {/* Título do grupo */}
                            <div className="mb-2 px-3">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
                                    {group.label}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="space-y-1">
                                {group.items.map(
                                    ({ href, label, icon: Icon }) => {
                                        const active = isActive(href);

                                        return (
                                            <Link
                                                key={href}
                                                href={href}
                                                className={`
                                                    group relative flex h-10 items-center gap-3 rounded-md px-3
                                                    text-[13px] font-medium
                                                    transition-all duration-150
                                                    ${active
                                                        ? "bg-white/[0.09] text-white"
                                                        : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                                                    }
                                                `}
                                            >
                                                {/* Indicador ativo */}
                                                {active && (
                                                    <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-emerald-400" />
                                                )}

                                                <Icon
                                                    className={`
                                                        h-[17px] w-[17px] shrink-0
                                                        transition-colors
                                                        ${active
                                                            ? "text-emerald-400"
                                                            : "text-white/45 group-hover:text-white/80"
                                                        }
                                                    `}
                                                    strokeWidth={active ? 2.2 : 1.8}
                                                />

                                                <span>{label}</span>
                                            </Link>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </nav>

            {/* Usuário */}
            <div className="border-t border-white/[0.07] p-3">
                {user ? (
                    <div className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-white/[0.04]">

                        {user.image ? (
                            <img
                                src={user.image}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-semibold text-emerald-400">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-white">
                                {user.name || "Usuário"}
                            </p>

                            <p className="mt-0.5 text-[10px] text-white/40">
                                Conta
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                signOut({ callbackUrl: "/" })
                            }
                            title="Sair"
                            className="
                                flex h-8 w-8 shrink-0 items-center justify-center
                                rounded-md text-white/40
                                transition-colors
                                hover:bg-red-500/10
                                hover:text-red-400
                            "
                        >
                            <LogOut
                                className="h-4 w-4"
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>
                ) : (
                    <Button
                        onClick={() =>
                            (window.location.href = "/login")
                        }
                        className="
                            h-10 w-full
                            border-0
                            bg-white
                            text-sm font-medium
                            text-[#052b2b]
                            shadow-none
                            hover:bg-white/90
                        "
                    >
                        Entrar com Google
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 md:block">
                <SidebarContent />
            </aside>

            {/* Mobile header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#052b2b] px-4 md:hidden">
                <Link href="/">
                    <Image
                        src={logoImg}
                        alt="FinUp"
                        width={100}
                        height={32}
                        className="object-contain"
                    />
                </Link>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(true)}
                    className="text-white hover:bg-white/10"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">

                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />

                    <div className="relative flex w-[250px] flex-col shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-4 top-5 z-50 flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
}