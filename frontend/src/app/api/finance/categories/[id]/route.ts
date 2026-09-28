import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { error: "ID da categoria não informado." },
                { status: 400 }
            );
        }

        const { name, icon, color } = await request.json();
        const category = await prisma.transactionCategory.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                name,
                icon,
                color,
            },
        });

        return NextResponse.json(category, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao atualizar categoria." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // editar, arquivar - nunca deletar de verdade para não perder o histórico
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { error: "ID da categoria não informado." },
                { status: 400 }
            );
        }

        const category = await prisma.transactionCategory.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                isActive: false,
            },
        });

        return NextResponse.json(category, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao deletar categoria." },
            { status: 500 }
        );
    }
}