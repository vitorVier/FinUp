import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const categories = await prisma.transactionCategory.findMany({
            where: {
                userId: session.user.id,
                type: "OUTFLOW",
                isActive: true,
            }
        });

        const categoriesResponse = categories.map((category) => ({
            id: category.id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
            isActive: category.isActive,
        }));

        return NextResponse.json(categoriesResponse, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao buscar categorias." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { name } = await request.json();
        const category = await prisma.transactionCategory.create({
            data: {
                userId: session.user.id,
                type: "OUTFLOW",
                name,
                icon: "ArrowUpRight",
                color: "#DC2626",
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (err) {
        console.error("ERRO AO CRIAR CATEGORIA:", err);

        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Erro ao criar categoria.",
            },
            { status: 500 }
        );
    }
}