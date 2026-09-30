import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const goalSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    targetValue: z.number().positive("O valor alvo deve ser positivo"),
    currentValue: z.number().positive("O valor atual deve ser positivo").optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"]).optional(),
    type: z.enum(["SAVING", "INVESTMENT", "PURCHASE", "TRAVEL", "EMERGENCY", "DEBT", "OTHER"]),
    targetDate: z.coerce.date().optional(),
    monthlyTarget: z.number().positive("O valor mensal deve ser positivo").optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    color: z.string().optional(),
    icon: z.string().optional(),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const goals = await prisma.goal.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(goals);
    } catch (err) {
        console.error("[goals] GET error:", err);
        return NextResponse.json(
            { error: "Erro ao buscar metas" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = goalSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos" },
                { status: 400 }
            );
        }

        const { data } = validation;

        const goal = await prisma.goal.create({
            data: {
                userId: session.user.id,
                ...data,
                monthlyTarget: data.monthlyTarget ?? 0,
            },
        });

        return NextResponse.json(goal, { status: 201 });
    } catch (err) {
        console.error("[goals] POST error:", err);
        return NextResponse.json(
            { error: "Erro ao criar meta" },
            { status: 500 }
        );
    }
}