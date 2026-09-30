import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const schema = z.object({
    name: z.string().trim().min(1).optional(),
    value: z.union([z.string(), z.number()]).optional(),
    categoryId: z.string().min(1).optional(),
    day: z.number().int().min(1).max(31).optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, value, categoryId, day, isActive } = schema.parse(body);

        if (categoryId) {
            const existente = await prisma.recurrence.findFirst({
                where: { id, userId: session.user.id },
            });
            if (!existente) {
                return NextResponse.json({ error: "Recorrência não encontrada." }, { status: 404 });
            }
            const category = await prisma.transactionCategory.findFirst({
                where: { id: categoryId, userId: session.user.id, type: existente.type },
            });
            if (!category) {
                return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
            }
        }

        const recorrencia = await prisma.recurrence.update({
            where: { id, userId: session.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(value !== undefined && { value: String(value) }),
                ...(categoryId !== undefined && { categoryId }),
                ...(day !== undefined && { day }),
                ...(isActive !== undefined && { isActive }),
            },
            include: { category: true },
        });

        return NextResponse.json(recorrencia);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos.", details: error.issues },
                { status: 400 }
            );
        }
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Recorrência não encontrada." }, { status: 404 });
        }
        console.error(error);
        return NextResponse.json({ error: "Erro ao atualizar recorrência." }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const { id } = await params;

        await prisma.recurrence.update({
            where: { id, userId: session.user.id },
            data: { isActive: false },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Recorrência não encontrada." }, { status: 404 });
        }
        console.error(error);
        return NextResponse.json({ error: "Erro ao remover recorrência." }, { status: 500 });
    }
}