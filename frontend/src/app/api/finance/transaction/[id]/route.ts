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
                { error: "ID do lançamento não informado." },
                { status: 400 }
            );
        }

        const { categoryId, value, description, date, paidAt, status } = await request.json();
        if (!status) {
            return NextResponse.json(
                { error: "Status não informado." },
                { status: 400 }
            );
        }

        if (status !== "PENDING" && status !== "CONFIRMED" && status !== "CANCELLED") {
            return NextResponse.json(
                { error: "Status inválido." },
                { status: 400 }
            );
        }

        const currentTransaction = await prisma.transaction.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!currentTransaction) {
            return NextResponse.json(
                { error: "Lançamento não encontrado." },
                { status: 404 }
            );
        }

        if (categoryId) {
            const category = await prisma.transactionCategory.findFirst({
                where: {
                    id: categoryId,
                    userId: session.user.id,
                    type: currentTransaction.type,
                    isActive: true,
                },
            });

            if (!category) {
                return NextResponse.json(
                    { error: "Categoria inválida." },
                    { status: 400 }
                );
            }
        }

        const transaction = await prisma.transaction.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                ...(categoryId && { categoryId }),
                ...(value !== undefined && { value: String(value) }),
                ...(description !== undefined && { description: description || null }),
                ...(date && { date: new Date(`${date}T12:00:00`) }),
                ...(status && { status }),
                paidAt: paidAt ? new Date(`${paidAt}T12:00:00`) : null,
            },
            include: {
                category: true
            }
        });

        return NextResponse.json(transaction, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao atualizar lançamento." },
            { status: 500 }
        );
    }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
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
                { error: "ID do lançamento não informado." },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.update({
            where: {
                id,
                userId: session.user.id
            },
            data: {
                status: "CANCELLED",
            },
        });

        return NextResponse.json(transaction, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao cancelar lançamento." },
            { status: 500 }
        );
    }
}