import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const schema = z.object({
    name: z.string().trim().min(1),
    value: z.union([z.string(), z.number()]),
    type: z.enum(["INFLOW", "OUTFLOW"]),
    categoryId: z.string().min(1),
    day: z.number().int().min(1).max(31),
});

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (type && type !== "INFLOW" && type !== "OUTFLOW") {
            return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
        }

        const recorrencias = await prisma.recurrence.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
                ...(type ? { type: type as "INFLOW" | "OUTFLOW" } : {}),
            },
            include: { category: true },
            orderBy: { day: "asc" },
        });

        return NextResponse.json(recorrencias);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao buscar recorrências." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const body = await request.json();
        const { name, value, type, categoryId, day } = schema.parse(body);

        const category = await prisma.transactionCategory.findFirst({
            where: { id: categoryId, userId: session.user.id, type },
        });
        if (!category) {
            return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
        }

        const recorrencia = await prisma.recurrence.create({
            data: {
                userId: session.user.id,
                name,
                value: String(value),
                type,
                categoryId,
                day
            },
            include: { category: true },
        });

        return NextResponse.json(recorrencia, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos.", details: error.issues },
                { status: 400 }
            );
        }
        console.error(error);
        return NextResponse.json({ error: "Erro ao criar recorrência." }, { status: 500 });
    }
}