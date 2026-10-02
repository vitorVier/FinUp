import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { generateCategoryColor } from "@/src/app/(panel)/finance/utils/utils";

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

        const existingCategories =
            await prisma.transactionCategory.findMany({
                where: {
                    userId: session.user.id,
                },
                select: {
                    color: true,
                },
            });

        const color = generateCategoryColor(
            "OUTFLOW",
            existingCategories.map(
                (category) => category.color
            )
        );

        const { name } = await request.json();

        const category =
            await prisma.transactionCategory.create({
                data: {
                    userId: session.user.id,
                    type: "OUTFLOW",
                    name,
                    icon: "ArrowUpRight",
                    color,
                },
            });

        return NextResponse.json(category, {
            status: 201,
        });
    } catch (err) {
        console.error(
            "ERRO AO CRIAR CATEGORIA:",
            err
        );

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